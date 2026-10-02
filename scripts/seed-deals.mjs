#!/usr/bin/env node
/**
 * Tạo sẵn một loạt deal cho tài khoản người bán, để màn hình có dữ liệu thật mà xem.
 *
 * Chạy thẳng vào backend chứ không nhét dữ liệu mẫu vào app — toàn bộ mock trong `src` đã được
 * gỡ, thêm lại sẽ phá đúng thứ vừa dọn.
 *
 *   LOOTFAST_EMAIL=ban@gmail.com LOOTFAST_PASSWORD=... node scripts/seed-deals.mjs
 *
 * Tuỳ chọn:
 *   --count=10            số deal muốn tạo (mặc định 10)
 *   --api=<url>           đổi backend (mặc định lấy EXPO_PUBLIC_API_URL trong .env)
 *   --dry-run             chỉ in ra kế hoạch, không gọi API ghi
 *   --download-images     tải ảnh mẫu từ picsum.photos vào scripts/seed-images/
 *
 * Ảnh lấy từ thư mục `scripts/seed-images/` (jpg/png). Thiếu ảnh thì script dùng vòng lặp lại
 * các ảnh đang có.
 *
 * Hai giới hạn của backend cần nhớ:
 *   - 10 lượt upload ảnh mỗi giờ cho mỗi quán, dùng chung với logo và ảnh bìa. 10 deal × 1 ảnh
 *     là chạm đúng trần, không còn dư cho lần thử lại nào.
 *   - Giờ nhận món phải nằm trong giờ mở cửa của quán và cùng một ngày theo lịch Việt Nam.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGE_DIR = path.join(ROOT, 'scripts', 'seed-images');

/** Việt Nam dùng UTC+7 cố định, không có giờ mùa hè, nên ghép offset thẳng vào chuỗi ISO. */
const VN_OFFSET = '+07:00';
const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh';

/** Backend bắt chốt đơn trước giờ nhận ít nhất 15 phút (ORDER_CUTOFF). */
const ORDER_CUTOFF_MINUTES = 15;

const DEALS = [
  { name: 'Cơm tấm sườn bì chả cuối ngày', originalPrice: 65000, discountedPrice: 35000, quantity: 12 },
  { name: 'Bún bò Huế đặc biệt suất chiều', originalPrice: 60000, discountedPrice: 32000, quantity: 10 },
  { name: 'Bánh mì thịt nướng pate', originalPrice: 35000, discountedPrice: 18000, quantity: 20 },
  { name: 'Phở bò tái nạm suất tối', originalPrice: 70000, discountedPrice: 38000, quantity: 8 },
  { name: 'Combo bánh ngọt cuối ngày', originalPrice: 90000, discountedPrice: 45000, quantity: 6 },
  { name: 'Cơm gà xối mỡ phần lớn', originalPrice: 55000, discountedPrice: 29000, quantity: 15 },
  { name: 'Bún chả Hà Nội suất đầy đặn', originalPrice: 60000, discountedPrice: 33000, quantity: 10 },
  { name: 'Xôi gà nấm hương', originalPrice: 40000, discountedPrice: 20000, quantity: 18 },
  { name: 'Mì Quảng gà ta', originalPrice: 58000, discountedPrice: 30000, quantity: 9 },
  { name: 'Cháo sườn ruốc nóng', originalPrice: 35000, discountedPrice: 17000, quantity: 14 },
];

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    return [key, value ?? true];
  }),
);

function fail(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

async function resolveApiUrl() {
  if (typeof args.api === 'string') return args.api.replace(/\/$/, '');

  const envPath = path.join(ROOT, '.env');
  if (!existsSync(envPath)) fail('Không tìm thấy .env. Truyền --api=<url> để chỉ định backend.');

  const match = /^EXPO_PUBLIC_API_URL=(.+)$/m.exec(await readFile(envPath, 'utf8'));
  if (!match) fail('Không thấy EXPO_PUBLIC_API_URL trong .env. Truyền --api=<url>.');

  return match[1].trim().replace(/\/$/, '');
}

/** Giờ địa phương Việt Nam, bất kể máy đang để múi giờ nào. */
function vietnamNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type).value;

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    weekday: new Intl.DateTimeFormat('en-US', { timeZone: VN_TIME_ZONE, weekday: 'long' })
      .format(new Date())
      .toUpperCase(),
  };
}

const toIso = (date, minutes) =>
  `${date}T${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:00${VN_OFFSET}`;

const toMinutes = (hhmm) => {
  const [hours, mins] = hhmm.split(':').map(Number);
  return hours * 60 + mins;
};

async function api(baseUrl, path, { method = 'GET', body, token, form } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(form ? {} : { 'Content-Type': 'application/json' }),
    },
    body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
  });

  if (response.status === 204) return undefined;

  const payload = await response.json().catch(() => null);
  if (!payload?.success) {
    const code = payload?.error?.code ?? `HTTP_${response.status}`;
    const message = payload?.error?.message ?? response.statusText;
    throw new Error(`${code} — ${message}`);
  }

  return payload.data;
}

async function downloadSampleImages(count) {
  await mkdir(IMAGE_DIR, { recursive: true });
  console.log(`  Tải ${count} ảnh mẫu từ picsum.photos vào scripts/seed-images/ …`);

  for (let index = 0; index < count; index += 1) {
    const response = await fetch(`https://picsum.photos/seed/lootfast${index}/800/600`);
    if (!response.ok) fail(`Không tải được ảnh mẫu (HTTP ${response.status}).`);

    const file = path.join(IMAGE_DIR, `mon-${String(index + 1).padStart(2, '0')}.jpg`);
    await writeFile(file, Buffer.from(await response.arrayBuffer()));
  }

  console.log('  Xong.\n');
}

async function loadImages() {
  if (!existsSync(IMAGE_DIR)) return [];

  const names = (await readdir(IMAGE_DIR)).filter((name) => /\.(jpe?g|png)$/i.test(name)).sort();

  return Promise.all(
    names.map(async (name) => ({
      name,
      buffer: await readFile(path.join(IMAGE_DIR, name)),
      type: /\.png$/i.test(name) ? 'image/png' : 'image/jpeg',
    })),
  );
}

async function main() {
  const baseUrl = await resolveApiUrl();
  const email = process.env.LOOTFAST_EMAIL;
  const password = process.env.LOOTFAST_PASSWORD;
  const count = Math.min(Number(args.count ?? 10), DEALS.length);
  const isDryRun = Boolean(args['dry-run']);

  if (args['download-images']) await downloadSampleImages(count);

  const images = await loadImages();
  if (images.length === 0) {
    fail(
      'Thư mục scripts/seed-images/ chưa có ảnh nào.\n' +
        '    Bỏ ảnh món vào đó, hoặc chạy lại với --download-images để lấy ảnh mẫu.',
    );
  }

  console.log(`\n  Backend : ${baseUrl}`);
  console.log(`  Số deal : ${count}`);
  console.log(`  Ảnh     : ${images.length} tệp trong scripts/seed-images/`);

  if (count > 10) {
    console.log('\n  ⚠ Backend chỉ cho 10 lượt upload ảnh mỗi giờ. Các deal vượt quá sẽ lỗi.');
  }

  if (isDryRun) {
    console.log('\n  --dry-run: chỉ in kế hoạch, không ghi gì lên server.\n');
    DEALS.slice(0, count).forEach((deal, index) => {
      console.log(`   ${index + 1}. ${deal.name} — ${deal.discountedPrice}đ / ${deal.quantity} phần`);
    });
    console.log('');
    return;
  }

  if (!email || !password) {
    fail('Thiếu LOOTFAST_EMAIL hoặc LOOTFAST_PASSWORD trong biến môi trường.');
  }

  console.log('\n  → Đăng nhập…');
  const session = await api(baseUrl, '/auth/signin', {
    method: 'POST',
    body: { email, password },
  });
  const token = session.accessToken;

  if (!session.roles?.includes('MERCHANT')) {
    fail('Tài khoản này chưa có quyền MERCHANT. Hồ sơ đăng ký bán hàng phải được duyệt trước.');
  }

  const profile = await api(baseUrl, '/merchants/me', { token });
  if (!profile.businessCategory) {
    fail('Hồ sơ quán chưa có nhóm món (businessCategory). Cập nhật Thông tin quán trước đã.');
  }

  const now = vietnamNow();
  const openingHours = await api(baseUrl, '/merchants/me/opening-hours', { token });
  const todaySlot = openingHours.slots?.find((slot) => slot.dayOfWeek === now.weekday);

  if (!todaySlot) {
    fail(
      `Quán không mở cửa hôm nay (${now.weekday}).\n` +
        '    Backend bắt giờ nhận món nằm trong giờ mở cửa, nên không đăng deal cho hôm nay được.',
    );
  }

  // Giờ nhận phải vừa trong giờ mở cửa, vừa còn ở tương lai, vừa cách hiện tại đủ để chốt đơn.
  const opens = toMinutes(todaySlot.opensAt);
  const closes = toMinutes(todaySlot.closesAt);
  const pickupStart = Math.max(opens, now.minutes + ORDER_CUTOFF_MINUTES + 5);
  const pickupEnd = closes;

  if (pickupStart >= pickupEnd) {
    fail(
      `Hôm nay không còn khung giờ hợp lệ (quán đóng lúc ${todaySlot.closesAt}).\n` +
        '    Chạy lại sớm hơn trong ngày, hoặc nới giờ mở cửa của quán.',
    );
  }

  const saleStart = now.minutes;
  const saleEnd = pickupStart - ORDER_CUTOFF_MINUTES;

  console.log(`  → Quán "${profile.storeName}", nhóm món ${profile.businessCategory}`);
  console.log(
    `  → Khung giờ nhận hôm nay: ${toIso(now.date, pickupStart).slice(11, 16)}–${toIso(now.date, pickupEnd).slice(11, 16)}\n`,
  );

  let created = 0;
  let published = 0;

  for (const [index, deal] of DEALS.slice(0, count).entries()) {
    const label = `${index + 1}/${count} ${deal.name}`;

    try {
      const draft = await api(baseUrl, '/merchants/me/deals', {
        method: 'POST',
        token,
        body: {
          name: deal.name,
          categoryCode: profile.businessCategory,
          originalPrice: deal.originalPrice,
          discountedPrice: deal.discountedPrice,
          totalQuantity: deal.quantity,
          preparationMinutes: 0,
          saleStartsAt: toIso(now.date, saleStart),
          saleEndsAt: toIso(now.date, saleEnd),
          pickupStartsAt: toIso(now.date, pickupStart),
          pickupEndsAt: toIso(now.date, pickupEnd),
        },
      });
      created += 1;

      const image = images[index % images.length];
      const form = new FormData();
      form.append('file', new Blob([image.buffer], { type: image.type }), image.name);
      await api(baseUrl, `/merchants/me/deals/${draft.dealId}/images`, {
        method: 'POST',
        token,
        form,
      });

      await api(baseUrl, `/merchants/me/deals/${draft.dealId}/publish`, { method: 'POST', token });
      published += 1;

      console.log(`  ✓ ${label}`);
    } catch (error) {
      console.log(`  ✖ ${label} — ${error.message}`);

      if (String(error.message).includes('MERCHANT_IMAGE_RATE_LIMITED')) {
        console.log('\n  Đã chạm trần 10 lượt upload ảnh mỗi giờ. Chờ hết giờ rồi chạy tiếp.\n');
        break;
      }
    }
  }

  console.log(`\n  Xong: tạo ${created} deal, đăng lên sàn ${published}.\n`);
}

main().catch((error) => fail(error.message));
