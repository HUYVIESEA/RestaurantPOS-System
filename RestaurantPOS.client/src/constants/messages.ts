/**
 * Centralized Messages Constants
 * Tập trung tất cả các thông báo trong hệ thống để dễ quản lý và đồng nhất
 */

// ==================== VOICE ASSISTANT (BẾP ƠI) ====================
export const VOICE_MESSAGES = {
  PERSONAS: ['Bếp ơi', 'Em ơi', 'Bạn ơi'] as const,
  GREETING: (persona: string) => `${persona} đây, mời gọi món`,
  ORDER_CONFIRMED: (count: number, persona: string) => `Đã thêm ${count} món. ${persona} nghe rõ!`,
  MIC_ERROR: 'Không thể khởi động micro. Vui lòng kiểm tra quyền truy cập.',
};

// ==================== CHUNG ====================
export const COMMON_MESSAGES = {
  LOADING: 'Đang tải...',
  SAVE_SUCCESS: 'Đã lưu thành công',
  SAVE_ERROR: 'Không thể lưu dữ liệu',
  DELETE_SUCCESS: 'Đã xóa thành công',
  DELETE_ERROR: 'Không thể xóa',
  LOAD_ERROR: 'Không thể tải dữ liệu',
  FORM_INVALID: 'Vui lòng kiểm tra lại thông tin',
  GENERIC_ERROR: 'Đã xảy ra lỗi. Vui lòng thử lại.',
  CONFIRM_DELETE: (entity: string, name?: string) => 
    name 
      ? `Bạn có chắc chắn muốn xóa ${entity} "${name}"? Thao tác này không thể hoàn tác.`
      : `Bạn có chắc chắn muốn xóa ${entity} này? Thao tác này không thể hoàn tác.`,
};

// ==================== ĐĂNG NHẬP ====================
export const AUTH_MESSAGES = {
  LOGIN_INVALID: 'Tên đăng nhập hoặc mật khẩu không đúng',
  LOGIN_ERROR: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.',
  LOGOUT_SUCCESS: 'Đã đăng xuất thành công',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  PASSWORD_CURRENT_WRONG: 'Mật khẩu hiện tại không đúng',
  PASSWORD_CHANGE_SUCCESS: 'Đổi mật khẩu thành công!',
  PASSWORD_CHANGE_ERROR: 'Không thể đổi mật khẩu',
};

// ==================== MÓN ĂN (MENU) ====================
export const PRODUCT_MESSAGES = {
  LOAD_ERROR: 'Không thể tải danh sách món ăn',
  CREATE_SUCCESS: 'Đã thêm món ăn thành công',
  UPDATE_SUCCESS: 'Đã cập nhật món ăn thành công',
  DELETE_SUCCESS: 'Đã xóa món ăn thành công',
  DELETE_ERROR: 'Không thể xóa món ăn',
  CONFIRM_DELETE_TITLE: 'Xác nhận xóa món ăn',
};

// ==================== DANH MỤC ====================
export const CATEGORY_MESSAGES = {
  LOAD_ERROR: 'Không thể tải danh sách danh mục',
  CREATE_SUCCESS: 'Đã thêm danh mục thành công',
  UPDATE_SUCCESS: 'Đã cập nhật danh mục thành công',
  DELETE_SUCCESS: 'Đã xóa danh mục thành công',
  DELETE_ERROR: 'Không thể xóa danh mục',
  CONFIRM_DELETE_TITLE: 'Xác nhận xóa danh mục',
};

// ==================== TỒN KHO ====================
export const INVENTORY_MESSAGES = {
  LOAD_ERROR: 'Không thể tải dữ liệu tồn kho',
  UPDATE_SUCCESS: (name: string) => `Đã cập nhật tồn kho cho "${name}"`,
  UPDATE_ERROR: 'Không thể cập nhật tồn kho',
  DELETE_SUCCESS: 'Đã xóa sản phẩm khỏi kho thành công',
  DELETE_ERROR: 'Không thể xóa sản phẩm',
  CONFIRM_DELETE_TITLE: 'Xác nhận xóa khỏi kho',
};

// ==================== ĐƠN HÀNG ====================
export const ORDER_MESSAGES = {
  LOAD_ERROR: 'Không thể tải danh sách đơn hàng',
  CREATE_SUCCESS: 'Đã tạo đơn hàng thành công',
  UPDATE_SUCCESS: 'Đã cập nhật đơn hàng thành công',
  SAVE_ERROR: 'Không thể lưu đơn hàng',
  STATUS_UPDATE_ERROR: 'Không thể cập nhật trạng thái đơn hàng',
  PAYMENT_SUCCESS: 'Thanh toán thành công',
  PAYMENT_ERROR: 'Lỗi thanh toán',
  CANCEL_SUCCESS: 'Đã hủy đơn hàng thành công',
  VOICE_ADDED: (items: string) => `🎤 Đã thêm ${items}`,
};

// ==================== BÀN ====================
export const TABLE_MESSAGES = {
  LOAD_ERROR: 'Không thể tải danh sách bàn',
  CREATE_SUCCESS: 'Đã thêm bàn thành công',
  UPDATE_SUCCESS: 'Đã cập nhật bàn thành công',
  DELETE_SUCCESS: 'Đã xóa bàn thành công',
  DELETE_ERROR: 'Không thể xóa bàn',
};

// ==================== NHÂN VIÊN ====================
export const USER_MESSAGES = {
  LOAD_ERROR: 'Không thể tải danh sách nhân viên',
  CREATE_SUCCESS: 'Đã tạo nhân viên thành công',
  UPDATE_SUCCESS: 'Đã cập nhật thông tin nhân viên thành công',
  DELETE_SUCCESS: 'Đã xóa nhân viên thành công',
  DELETE_ERROR: 'Không thể xóa nhân viên',
  PROFILE_UPDATE_SUCCESS: 'Đã cập nhật hồ sơ thành công',
  PROFILE_UPDATE_ERROR: 'Không thể cập nhật hồ sơ',
  PROFILE_LOAD_ERROR: 'Không thể tải thông tin hồ sơ',
  ROLE_CHANGE_SUCCESS: (role: string) => `Đã đổi vai trò thành ${role}`,
  ROLE_CHANGE_ERROR: 'Không thể đổi vai trò',
  PASSWORD_RESET_SUCCESS: 'Đã đặt lại mật khẩu thành công',
  PASSWORD_RESET_ERROR: 'Không thể đặt lại mật khẩu',
  STATUS_ACTIVATE_SUCCESS: 'Đã kích hoạt tài khoản thành công',
  STATUS_DEACTIVATE_SUCCESS: 'Đã vô hiệu hóa tài khoản thành công',
  STATUS_CHANGE_ERROR: 'Không thể thay đổi trạng thái tài khoản',
  CONFIRM_DELETE_TITLE: 'Xác nhận xóa nhân viên',
};

// ==================== THANH TOÁN ====================
export const PAYMENT_MESSAGES = {
  VNPAY_ERROR: 'Không thể tạo giao dịch VNPay',
  QR_ERROR: 'Không thể tạo mã QR thanh toán',
  SUCCESS: 'Thanh toán thành công',
  FAILED: 'Thanh toán thất bại',
};

// ==================== THỐNG KÊ ====================
export const ANALYTICS_MESSAGES = {
  LOAD_ERROR: 'Không thể tải dữ liệu thống kê',
};

// ==================== KITCHEN ====================
export const KITCHEN_MESSAGES = {
  ORDER_READY: 'Món ăn đã sẵn sàng!',
  ORDER_PREPARING: 'Đang chuẩn bị...',
  MARK_COMPLETE_SUCCESS: 'Đã đánh dấu hoàn thành',
  MARK_COMPLETE_ERROR: 'Không thể cập nhật trạng thái món',
};
