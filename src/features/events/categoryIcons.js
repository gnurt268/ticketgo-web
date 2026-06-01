// Registry các icon category có sẵn trong public/icons/categories/
// Dùng cho icon picker ở trang Admin > Quản lý Categories.
//
// Khi thêm 1 file SVG mới vào public/icons/categories/, thêm 1 dòng tương ứng
// vào đây để icon picker hiển thị nó.
export const CATEGORY_ICON_OPTIONS = [
  { path: '/icons/categories/nhac-song.svg', label: 'Nhạc sống' },
  { path: '/icons/categories/san-khau-nghe-thuat.svg', label: 'Sân khấu & Nghệ thuật' },
  { path: '/icons/categories/the-thao.svg', label: 'Thể thao' },
  { path: '/icons/categories/khac.svg', label: 'Khác' },
  { path: '/icons/categories/default.svg', label: 'Mặc định' },
];
