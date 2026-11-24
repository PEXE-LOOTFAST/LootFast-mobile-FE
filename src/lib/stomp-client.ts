/**
 * Client STOMP 1.2 tối giản chạy trên WebSocket có sẵn của React Native (và trình duyệt).
 *
 * Chỉ làm đúng việc app cần: kết nối kèm access token, đăng ký một hàng đợi, nhận MESSAGE, giữ
 * heart-beat và tự kết nối lại. Không dùng @stomp/stompjs vì thư viện đó cần chỉnh riêng cho RN
 * (ký tự NULL cuối frame) mà vẫn kéo theo nhiều thứ app không dùng.
 *
 * File này không import gì của RN để chạy thử được bằng Node.
 */

type Frame = { command: string; headers: Record<string, string>; body: string };

export type StompConnectionOptions = {
  url: string;
  /** Hàng đợi cần nghe, vd. "/user/queue/notifications". */
  destination: string;
  getToken: () => Promise<string | null>;
  /**
   * Server từ chối token (hết hạn hoặc sai). Trả true nếu đã có token mới để kết nối lại ngay,
   * false thì dừng hẳn.
   */
  onAuthRejected: () => Promise<boolean>;
  onMessage: (body: string) => void;
  /** Gọi mỗi lần kết nối xong; `isReconnect` cho biết trước đó đã từng kết nối. */
  onConnected?: (isReconnect: boolean) => void;
  heartbeatMs?: number;
  /** Thay WebSocket toàn cục, để chạy thử bằng Node. */
  WebSocketImpl?: typeof WebSocket;
};

const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000];
// Server từ chối token hai lần liền dù đã làm mới thì dừng, tránh vòng lặp kết nối vô tận.
const MAX_AUTH_RETRIES = 1;

const ESCAPES: Record<string, string> = { '\\n': '\n', '\\r': '\r', '\\c': ':', '\\\\': '\\' };
const unescapeHeader = (value: string) =>
  value.replace(/\\[nrc\\]/g, (match) => ESCAPES[match] ?? match);

function encodeFrame(command: string, headers: Record<string, string>) {
  const lines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  return `${command}\n${lines.join('\n')}\n\n\0`;
}

function parseFrame(raw: string): Frame | null {
  // Bỏ các ký tự xuống dòng đứng trước frame (heart-beat dính liền với frame).
  const text = raw.replace(/^[\r\n]+/, '');
  if (!text) return null;

  const headerEnd = text.search(/\r?\n\r?\n/);
  const head = headerEnd === -1 ? text : text.slice(0, headerEnd);
  const body = headerEnd === -1 ? '' : text.slice(headerEnd).replace(/^\r?\n\r?\n/, '');
  const [command = '', ...headerLines] = head.split(/\r?\n/);
  const headers: Record<string, string> = {};

  for (const line of headerLines) {
    const colon = line.indexOf(':');
    if (colon <= 0) continue;
    const key = unescapeHeader(line.slice(0, colon));
    // STOMP 1.2: header lặp lại thì lấy giá trị đầu tiên.
    if (!(key in headers)) headers[key] = unescapeHeader(line.slice(colon + 1));
  }

  return { command, headers, body };
}

export class StompConnection {
  private socket: WebSocket | null = null;
  private stopped = true;
  private attempts = 0;
  private authRetries = 0;
  private authRejected = false;
  private hasConnected = false;
  private buffer = '';
  private lastSeen = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: StompConnectionOptions) {}

  start() {
    if (!this.stopped) return;
    this.stopped = false;
    void this.connect();
  }

  stop() {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.clearHeartbeat();
    const socket = this.socket;
    this.socket = null;
    if (!socket) return;
    try {
      if (socket.readyState === 1) socket.send(encodeFrame('DISCONNECT', {}));
      socket.close();
    } catch {
      // Socket đã đóng sẵn.
    }
  }

  private get heartbeatMs() {
    return this.options.heartbeatMs ?? 10_000;
  }

  private async connect() {
    if (this.stopped) return;
    const token = await this.options.getToken();
    if (this.stopped) return;
    if (!token) {
      this.stopped = true;
      return;
    }

    const Impl = this.options.WebSocketImpl ?? WebSocket;
    const socket = new Impl(this.options.url);
    this.socket = socket;
    this.buffer = '';

    socket.onopen = () => {
      this.lastSeen = Date.now();
      socket.send(
        encodeFrame('CONNECT', {
          'accept-version': '1.2',
          host: new URL(this.options.url).host,
          'heart-beat': `${this.heartbeatMs},${this.heartbeatMs}`,
          Authorization: `Bearer ${token}`,
        }),
      );
    };
    socket.onmessage = (event: { data: unknown }) => {
      if (this.socket !== socket) return;
      this.lastSeen = Date.now();
      if (typeof event.data === 'string') this.receive(socket, event.data);
    };
    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.socket = null;
      this.clearHeartbeat();
      void this.afterClose();
    };
    // Lỗi mạng luôn kéo theo onclose, nên xử lý kết nối lại ở đó.
    socket.onerror = () => {};
  }

  private receive(socket: WebSocket, data: string) {
    this.buffer += data;
    let end = this.buffer.indexOf('\0');
    while (end !== -1) {
      const frame = parseFrame(this.buffer.slice(0, end));
      this.buffer = this.buffer.slice(end + 1);
      if (frame) this.handle(socket, frame);
      end = this.buffer.indexOf('\0');
    }
  }

  private handle(socket: WebSocket, frame: Frame) {
    switch (frame.command) {
      case 'CONNECTED': {
        const isReconnect = this.hasConnected;
        this.hasConnected = true;
        this.attempts = 0;
        this.authRetries = 0;
        socket.send(
          encodeFrame('SUBSCRIBE', {
            id: 'sub-0',
            destination: this.options.destination,
            ack: 'auto',
          }),
        );
        this.startHeartbeat(socket, frame.headers['heart-beat']);
        this.options.onConnected?.(isReconnect);
        break;
      }
      case 'MESSAGE':
        this.options.onMessage(frame.body);
        break;
      case 'ERROR': {
        const message = frame.headers.message ?? '';
        this.authRejected = /token|authentication/i.test(message);
        // Server không tự đóng socket sau ERROR ngay, nên chủ động đóng để kết nối lại.
        socket.close();
        break;
      }
    }
  }

  private startHeartbeat(socket: WebSocket, serverHeartbeat: string | undefined) {
    this.clearHeartbeat();
    // "sx,sy" của server: sx > 0 nghĩa là server hứa gửi nhịp ít nhất mỗi max(sx, nhịp mình xin).
    const serverSends = Number(serverHeartbeat?.split(',')[0] ?? 0);
    const incomingMs = serverSends > 0 ? Math.max(serverSends, this.heartbeatMs) : 0;

    this.heartbeatTimer = setInterval(() => {
      // Quá 2,5 nhịp không nhận được gì (kể cả heart-beat của server) thì coi như mất kết nối.
      if (incomingMs > 0 && Date.now() - this.lastSeen > incomingMs * 2.5) {
        socket.close();
        return;
      }
      if (socket.readyState === 1) socket.send('\n');
    }, this.heartbeatMs);
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private async afterClose() {
    if (this.stopped) return;

    if (this.authRejected) {
      this.authRejected = false;
      if (this.authRetries >= MAX_AUTH_RETRIES || !(await this.options.onAuthRejected())) {
        this.stopped = true;
        return;
      }
      this.authRetries += 1;
      void this.connect();
      return;
    }

    const delay =
      RECONNECT_DELAYS_MS[Math.min(this.attempts, RECONNECT_DELAYS_MS.length - 1)] ?? 30_000;
    this.attempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, delay);
  }
}
