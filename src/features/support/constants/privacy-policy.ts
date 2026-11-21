export const SUPPORT_EMAIL = 'lootfast.app@gmail.com';

/** Tiêu đề email xoá tài khoản theo đúng mục 6 của chính sách để nhóm hỗ trợ lọc thư. */
export const ACCOUNT_DELETION_SUBJECT = 'Yêu cầu xóa tài khoản LootFast';

/** Khớp PRIVACY_POLICY_VERSION gửi lúc đăng ký: sửa nội dung thì cập nhật cả hai. */
export const PRIVACY_POLICY_UPDATED_AT = '5 tháng 11, 2026';

export type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: { label?: string; text: string }[];
  /** Đoạn nằm sau danh sách gạch đầu dòng. */
  footer?: string;
};

export const PRIVACY_POLICY_INTRO =
  'Chính sách này mô tả cách LootFast thu thập, sử dụng, lưu giữ và chia sẻ thông tin khi bạn sử dụng ứng dụng LootFast. LootFast là nền tảng giúp người dùng tìm và đặt mua các sản phẩm được cửa hàng đăng bán.';

export const PRIVACY_POLICY_SECTIONS: PolicySection[] = [
  {
    title: '1. Thông tin chúng tôi thu thập',
    paragraphs: ['Tùy theo tính năng bạn sử dụng, LootFast có thể xử lý:'],
    bullets: [
      {
        label: 'Thông tin tài khoản',
        text: 'tên, địa chỉ email, số điện thoại và thông tin xác thực tài khoản.',
      },
      {
        label: 'Thông tin hồ sơ',
        text: 'thông tin bạn cung cấp để sử dụng ứng dụng với tư cách người mua hoặc cửa hàng/người bán, chẳng hạn tên cửa hàng và thông tin liên hệ.',
      },
      {
        label: 'Thông tin đơn hàng',
        text: 'sản phẩm, số lượng, giá trị đơn hàng, thời gian đặt hàng, trạng thái đơn hàng và thông tin cần thiết để xử lý đơn.',
      },
      {
        label: 'Thông tin thanh toán',
        text: 'số tiền, trạng thái và mã giao dịch liên quan đến đơn hàng. Thông tin thẻ hoặc thông tin thanh toán nhạy cảm được xử lý bởi đơn vị thanh toán nếu tính năng thanh toán qua đơn vị đó được tích hợp.',
      },
      {
        label: 'Thông tin hỗ trợ',
        text: 'nội dung bạn gửi khi liên hệ với nhóm LootFast để được hỗ trợ.',
      },
      {
        label: 'Dữ liệu kỹ thuật',
        text: 'thông tin nhật ký và chẩn đoán cơ bản cần thiết để duy trì, bảo vệ và khắc phục sự cố của ứng dụng.',
      },
    ],
  },
  {
    title: '2. Cách chúng tôi sử dụng thông tin',
    paragraphs: ['Chúng tôi sử dụng thông tin để:'],
    bullets: [
      { text: 'Tạo và quản lý tài khoản, hồ sơ người mua và hồ sơ cửa hàng.' },
      { text: 'Hiển thị sản phẩm, tiếp nhận và xử lý đơn hàng.' },
      { text: 'Gửi thông tin cần thiết về đơn hàng và tài khoản.' },
      { text: 'Xử lý, đối soát trạng thái thanh toán khi tính năng này được sử dụng.' },
      { text: 'Trả lời yêu cầu hỗ trợ, bảo vệ tài khoản và ngăn chặn hành vi lạm dụng.' },
      { text: 'Duy trì, sửa lỗi và cải thiện hoạt động của LootFast.' },
    ],
  },
  {
    title: '3. Chia sẻ thông tin',
    paragraphs: [
      'Chúng tôi không bán thông tin cá nhân của bạn. Thông tin có thể được chia sẻ trong phạm vi cần thiết với:',
    ],
    bullets: [
      { text: 'Cửa hàng/người bán liên quan đến đơn hàng để tiếp nhận và xử lý đơn.' },
      {
        text: 'Nhà cung cấp dịch vụ máy chủ, cơ sở dữ liệu, xác thực hoặc hỗ trợ kỹ thuật đang vận hành LootFast.',
      },
      { text: 'Đơn vị thanh toán, nếu giao dịch được xử lý thông qua đơn vị đó.' },
      {
        text: 'Cơ quan có thẩm quyền khi pháp luật yêu cầu hoặc để bảo vệ quyền và sự an toàn của người dùng.',
      },
    ],
    footer:
      'Các nhà cung cấp dịch vụ chỉ được xử lý thông tin cần thiết để thực hiện dịch vụ của họ.',
  },
  {
    title: '4. Vị trí và quyền trên thiết bị',
    paragraphs: [
      'LootFast chỉ truy cập quyền trên thiết bị khi cần cho một tính năng mà bạn sử dụng và khi bạn cấp quyền. Nếu phiên bản ứng dụng có yêu cầu quyền vị trí, ảnh, camera hoặc quyền khác, mục đích sử dụng sẽ được thông báo trong ứng dụng tại thời điểm yêu cầu quyền.',
    ],
  },
  {
    title: '5. Lưu giữ và bảo vệ thông tin',
    paragraphs: [
      'Chúng tôi lưu giữ thông tin trong thời gian cần thiết để cung cấp dịch vụ, duy trì tài khoản, xử lý đơn hàng, giải quyết tranh chấp và đáp ứng nghĩa vụ pháp lý. Chúng tôi áp dụng các biện pháp hợp lý để bảo vệ thông tin khỏi truy cập, thay đổi hoặc tiết lộ trái phép. Không có phương thức truyền tải hoặc lưu trữ điện tử nào bảo đảm an toàn tuyệt đối.',
    ],
  },
  {
    title: '6. Xóa tài khoản và dữ liệu',
    paragraphs: [
      `Bạn có thể yêu cầu xóa tài khoản LootFast và dữ liệu cá nhân liên quan bằng cách gửi email đến ${SUPPORT_EMAIL} với tiêu đề “${ACCOUNT_DELETION_SUBJECT}”, đồng thời ghi email hoặc số điện thoại đã đăng ký tài khoản.`,
      'Chúng tôi sẽ xác minh yêu cầu và xóa hoặc ẩn danh dữ liệu trong phạm vi phù hợp. Một số thông tin giao dịch có thể được lưu lại nếu cần để đáp ứng nghĩa vụ pháp lý, giải quyết tranh chấp hoặc bảo vệ an toàn dịch vụ.',
    ],
  },
  {
    title: '7. Quyền riêng tư của trẻ em',
    paragraphs: [
      'LootFast không được thiết kế dành riêng cho trẻ em. Nếu bạn cho rằng trẻ em đã cung cấp thông tin cá nhân cho chúng tôi, hãy liên hệ qua email bên dưới để yêu cầu kiểm tra và xử lý.',
    ],
  },
  {
    title: '8. Thay đổi chính sách',
    paragraphs: [
      'Chúng tôi có thể cập nhật chính sách này khi tính năng hoặc cách xử lý dữ liệu thay đổi. Bản mới sẽ được đăng tại trang này cùng ngày cập nhật.',
    ],
  },
  {
    title: '9. Liên hệ',
    paragraphs: [
      `Nếu có câu hỏi hoặc yêu cầu liên quan đến quyền riêng tư, hãy liên hệ: ${SUPPORT_EMAIL}`,
    ],
  },
];
