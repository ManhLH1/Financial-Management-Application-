# Header Component

Component Header tái sử dụng cho tất cả các trang trong ứng dụng Financial Management.

## 📦 Import

```jsx
import Header from '../components/Header'
```

## 🎯 Sử dụng cơ bản

```jsx
<Header 
  title="Dashboard"
  subtitle="Tổng quan tài chính"
  icon="📊"
  darkMode={darkMode}
  setDarkMode={setDarkMode}
  showDarkModeToggle={true}
/>
```

## 📋 Props

| Prop | Type | Required | Default | Mô tả |
|------|------|----------|---------|-------|
| `title` | string | No | 'Dashboard' | Tiêu đề hiển thị ở header |
| `subtitle` | string | No | 'Tổng quan tài chính' | Phụ đề mô tả ngắn |
| `icon` | string | No | '📊' | Emoji icon hiển thị |
| `darkMode` | boolean | No | false | Trạng thái dark mode |
| `setDarkMode` | function | No | null | Hàm để toggle dark mode |
| `showDarkModeToggle` | boolean | No | true | Hiển thị nút dark mode |

## 🎨 Features

- ✅ Responsive design (Desktop & Mobile)
- ✅ Active state cho navigation item hiện tại
- ✅ Dark mode toggle
- ✅ User authentication (Login/Logout)
- ✅ User avatar & info display
- ✅ Smooth transitions & animations

## 🧭 Navigation Items

Header tự động render các navigation items:

- 📊 Dashboard (`/`)
- 📋 Ngân sách (`/budget-dashboard`)
- 💰 Chi tiêu (`/expenses`)
- 📝 Khoản nợ (`/debts`)
- 🔄 Định kỳ (`/recurring`)
- 📜 Lịch sử (`/transaction-history`)

## 📱 Responsive Behavior

### Desktop (≥ 1024px)
- Navigation items inline với header
- Full user info với email
- Logout button visible

### Mobile (< 1024px)
- Navigation items xuống dòng dưới
- Horizontal scroll cho navigation
- Compact user info
- Logout button trong mobile nav

## 🎨 Styling

Component sử dụng Tailwind CSS với color scheme:

- **Primary**: `#1B3C53` 
- **Secondary**: `#234C6A`
- **Accent**: `#456882`
- **Highlight**: `#D2C1B6`

### Dark Mode Colors
- Background: `slate-900` / `slate-800`
- Border: `slate-700`
- Enhanced shadows

## 💡 Examples

### Với Dark Mode
```jsx
const [darkMode, setDarkMode] = useState(false)

<Header 
  title="Chi tiêu"
  subtitle="Quản lý chi tiêu hàng ngày"
  icon="💰"
  darkMode={darkMode}
  setDarkMode={setDarkMode}
  showDarkModeToggle={true}
/>
```

### Không có Dark Mode Toggle
```jsx
<Header 
  title="Lịch sử giao dịch"
  subtitle="Xem tất cả giao dịch"
  icon="📜"
  darkMode={false}
  setDarkMode={null}
  showDarkModeToggle={false}
/>
```

## 🔧 Customization

Để thêm navigation item mới, edit `navItems` array trong `Header.js`:

```jsx
const navItems = [
  { href: '/new-page', icon: '🎯', label: 'Trang mới' },
  // ... existing items
]
```

## 📝 Notes

- Component tự động detect trang hiện tại qua `useRouter()`
- Active state được highlight với border và background khác biệt
- User session được quản lý qua `next-auth`
- All text và labels có thể dễ dàng internationalize

## 🚀 Performance

- Zero dependencies ngoài Next.js và next-auth
- Lightweight component
- Optimized re-renders với proper prop passing
- Smooth CSS transitions

---

**Version**: 1.0.0  
**Last Updated**: 11/10/2025
