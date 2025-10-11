# 🎨 Mobile Components Library

## 📦 Component Index

Tất cả components mobile-optimized cho Financial Management App.

---

## 1. 🧭 MobileBottomNav

**File**: `components/MobileBottomNav.js`

### Features
- ✅ Fixed bottom navigation (iOS/Android style)
- ✅ 5 main navigation items
- ✅ Active state with top indicator
- ✅ Scale animation on active
- ✅ Safe area support
- ✅ Dark mode compatible

### Usage
```jsx
import MobileBottomNav from '../components/MobileBottomNav'

<MobileBottomNav />
```

### Props
None (uses `useRouter` internally)

### Navigation Items
1. 📊 Trang chủ → `/`
2. 💰 Chi tiêu → `/expenses`
3. 📋 Ngân sách → `/budget-dashboard`
4. 📝 Khoản nợ → `/debts`
5. 🔄 Định kỳ → `/recurring`

### Styling
- Height: `h-16` (64px)
- Grid: `grid-cols-5`
- Active: Blue accent + top bar
- Shadow: Border-top only

---

## 2. 📱 MobileHeader

**File**: `components/MobileHeader.js`

### Features
- ✅ Compact single-row header
- ✅ Sticky positioning
- ✅ Optional back button
- ✅ Dark mode toggle
- ✅ User avatar with dropdown
- ✅ Title truncation

### Usage
```jsx
import MobileHeader from '../components/MobileHeader'

<MobileHeader
  title="Chi tiêu"
  icon="💰"
  darkMode={darkMode}
  setDarkMode={setDarkMode}
  showBackButton={false}
  onBack={() => router.back()}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | 'Dashboard' | Page title |
| `icon` | string | '📊' | Page icon emoji |
| `darkMode` | boolean | false | Dark mode state |
| `setDarkMode` | function | null | Dark mode setter |
| `showBackButton` | boolean | false | Show back arrow |
| `onBack` | function | null | Back button handler |

### Dropdown Menu Items
- 📜 Lịch sử giao dịch
- 📊 Phân tích nâng cao
- 🚪 Đăng xuất

---

## 3. 📊 MobileSummaryCard

**File**: `components/MobileSummaryCard.js`

### Features
- ✅ Touch-optimized card
- ✅ Icon + Label + Value + Subtitle
- ✅ Gradient backgrounds
- ✅ Optional trend indicator
- ✅ Optional onClick handler
- ✅ Active state animation

### Usage
```jsx
import MobileSummaryCard from '../components/MobileSummaryCard'

<MobileSummaryCard
  icon="💰"
  label="Thu nhập"
  value="5,000,000đ"
  subtitle="15 giao dịch"
  gradient="bg-gradient-to-br from-green-500 to-green-600"
  trend={{ value: '+5%', positive: true }}
  onClick={() => navigate('/income-details')}
/>
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | string | ✅ | Emoji icon |
| `label` | string | ✅ | Card label |
| `value` | string | ✅ | Main value (formatted) |
| `subtitle` | string | ❌ | Additional info |
| `gradient` | string | ✅ | Tailwind gradient classes |
| `trend` | object | ❌ | `{ value: '+5%', positive: true }` |
| `onClick` | function | ❌ | Click handler |

### Trend Object
```javascript
{
  value: string,    // e.g., '+5%', '-10%'
  positive: boolean // true = green, false = red
}
```

---

## 4. 💳 MobileTransactionItem

**File**: `components/MobileTransactionItem.js`

### Features
- ✅ Large touch targets
- ✅ Clear visual hierarchy
- ✅ Income/Expense color coding
- ✅ Edit & Delete actions
- ✅ Active state feedback
- ✅ Dark mode support

### Usage
```jsx
import MobileTransactionItem from '../components/MobileTransactionItem'

<MobileTransactionItem
  icon="🍽️"
  title="Ăn trưa"
  category="Ăn uống"
  amount="50,000đ"
  date="2025-01-11"
  type="expense"
  onEdit={() => handleEdit(item.id)}
  onDelete={() => handleDelete(item.id)}
  darkMode={darkMode}
/>
```

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | string | ✅ | Category icon |
| `title` | string | ✅ | Transaction title |
| `category` | string | ✅ | Category name |
| `amount` | string | ✅ | Formatted amount |
| `date` | string | ✅ | Transaction date |
| `type` | string | ✅ | 'income' or 'expense' |
| `onEdit` | function | ❌ | Edit handler |
| `onDelete` | function | ❌ | Delete handler |
| `darkMode` | boolean | ❌ | Dark mode state |

### Color Coding
- **Income**: Green (`text-green-600`)
- **Expense**: Red (`text-red-600`)
- Icon background: Matching light tint

---

## 5. ➕ MobileFloatingButton

**File**: `components/MobileFloatingButton.js`

### Features
- ✅ Material Design FAB
- ✅ Customizable position
- ✅ Multiple color schemes
- ✅ Ripple effect on tap
- ✅ Icon + Label
- ✅ Gradient background

### Usage
```jsx
import MobileFloatingButton from '../components/MobileFloatingButton'

<MobileFloatingButton
  icon="➕"
  label="Thêm mới"
  onClick={handleAdd}
  position="bottom-right"
  color="blue"
/>
```

### Props
| Prop | Type | Default | Options |
|------|------|---------|---------|
| `icon` | string | '➕' | Any emoji |
| `label` | string | 'Thêm' | Button text |
| `onClick` | function | required | Click handler |
| `position` | string | 'bottom-right' | 'bottom-right', 'bottom-center', 'bottom-left' |
| `color` | string | 'blue' | 'blue', 'green', 'red', 'purple' |

### Positioning
- **bottom-right**: `bottom-20 right-4`
- **bottom-center**: `bottom-20 left-1/2 -translate-x-1/2`
- **bottom-left**: `bottom-20 left-4`

*Note: `bottom-20` ensures button sits above bottom nav*

### Color Schemes
```javascript
{
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600'
}
```

---

## 🛠️ Utility Functions

**File**: `lib/mobileHelpers.js`

### 1. useIsMobile()
```javascript
const isMobile = useIsMobile()
// Returns: boolean (true if < 1024px)
```

### 2. useSwipeGesture()
```javascript
const swipeHandlers = useSwipeGesture(
  () => handleSwipeLeft(),
  () => handleSwipeRight()
)

<div {...swipeHandlers}>Swipeable content</div>
```

### 3. usePullToRefresh()
```javascript
const pullHandlers = usePullToRefresh(async () => {
  await fetchFreshData()
})

<div {...pullHandlers}>
  {pullHandlers.showIndicator && <Spinner />}
  Content
</div>
```

### 4. formatMobileCurrency()
```javascript
formatMobileCurrency(1500000)      // "1.5M"
formatMobileCurrency(1500000000)   // "1.5B"
formatMobileCurrency(5000)         // "5K"
formatMobileCurrency(500)          // "500"
```

### 5. vibrateOnAction()
```javascript
<button onClick={() => {
  vibrateOnAction(10) // 10ms vibration
  handleClick()
}}>
```

---

## 🎨 Common Patterns

### Pattern 1: Desktop/Mobile Split
```jsx
{/* Desktop */}
<div className="hidden lg:block">
  <Header {...props} />
</div>

{/* Mobile */}
<MobileHeader {...props} />
```

### Pattern 2: Responsive Grid
```jsx
{/* Desktop: 4 columns, Mobile: 2 columns */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
  <MobileSummaryCard {...card1} />
  <MobileSummaryCard {...card2} />
  <MobileSummaryCard {...card3} />
  <MobileSummaryCard {...card4} />
</div>
```

### Pattern 3: Conditional Padding
```jsx
<div className="px-0 sm:px-4 lg:px-8 py-4 lg:py-8">
  {/* No padding on mobile, progressive on larger screens */}
</div>
```

### Pattern 4: Bottom Spacing for Nav
```jsx
<div className="pb-20 lg:pb-8">
  {/* Extra bottom padding on mobile for nav bar */}
</div>
```

### Pattern 5: Mobile-only FAB
```jsx
<MobileFloatingButton
  icon="➕"
  label="Thêm"
  onClick={handleAdd}
/>
{/* Component has built-in lg:hidden */}
```

---

## 📐 Size Reference

### Touch Targets (Minimum)
- **iOS guideline**: 44px × 44px
- **Material Design**: 48px × 48px
- **Recommended**: 48px × 48px or larger

### Component Sizes
```javascript
MobileBottomNav:    64px height (h-16)
MobileHeader:       52px height (py-3)
MobileSummaryCard:  ~120px height (auto)
MobileTransactionItem: ~80px height (auto)
FAB:                56px height (py-4)
```

### Spacing Scale
```css
gap-3    = 12px  (mobile cards)
gap-4    = 16px  (desktop cards)
px-4     = 16px  (mobile padding)
px-8     = 32px  (desktop padding)
py-4     = 16px  (mobile vertical)
py-8     = 32px  (desktop vertical)
```

---

## 🎯 Integration Checklist

For each page:

1. **Import components**
```javascript
import MobileHeader from '../components/MobileHeader'
import MobileBottomNav from '../components/MobileBottomNav'
import MobileSummaryCard from '../components/MobileSummaryCard'
import MobileFloatingButton from '../components/MobileFloatingButton'
import { vibrateOnAction } from '../lib/mobileHelpers'
```

2. **Split headers**
```jsx
<div className="hidden lg:block">
  <Header {...desktopProps} />
</div>
<MobileHeader {...mobileProps} />
```

3. **Dual stats cards**
```jsx
{/* Desktop */}
<div className="hidden lg:grid grid-cols-4 gap-4">
  {desktopCards}
</div>

{/* Mobile */}
<div className="lg:hidden grid grid-cols-2 gap-3 px-4">
  {mobileCards}
</div>
```

4. **Add bottom nav**
```jsx
<MobileBottomNav />
{/* Place before closing </div> of main container */}
```

5. **Optional FAB**
```jsx
<MobileFloatingButton
  onClick={handleAction}
  icon="➕"
  label="Thêm"
/>
```

6. **Adjust padding**
```jsx
<div className="px-0 sm:px-4 lg:px-8 py-4 lg:py-8 pb-20 lg:pb-8">
  {/* Mobile: no side padding, 80px bottom
      Desktop: normal padding */}
</div>
```

---

## 🎨 Visual Hierarchy

### MobileSummaryCard Anatomy
```
┌─────────────────────────────┐
│ Label           Icon (2xl)  │ ← Header (mb-3)
│                             │
│ Value (2xl, bold)           │ ← Main value
│ Subtitle (xs)               │ ← Additional info
│ [Trend Badge]               │ ← Optional
└─────────────────────────────┘
  Gradient background
  Rounded-2xl (16px)
  Shadow-lg
  Padding: 16px
```

### MobileTransactionItem Anatomy
```
┌──────────────────────────────────┐
│ [Icon]  Title          +/-Amount │ ← Top row
│         Category                 │ ← Subtitle
│         📅 Date    [Edit] [Del]  │ ← Footer
└──────────────────────────────────┘
  White/Slate-800 background
  Rounded-xl (12px)
  Border
  Padding: 16px
```

### MobileBottomNav Anatomy
```
┌──────────────────────────────────┐
│ ━━━━                             │ ← Active indicator (top bar)
│ [📊] [💰] [📋] [📝] [🔄]        │ ← Icons (2xl)
│  Trang  Chi   Ngân  Khoản Định  │ ← Labels (xs)
│  chủ    tiêu  sách  nợ    kỳ    │
└──────────────────────────────────┘
  Fixed bottom
  Grid-cols-5
  Height: 64px
  Safe area support
```

---

## 🚀 Quick Start

### 1. Copy Components
```bash
components/
  ├── MobileBottomNav.js
  ├── MobileHeader.js
  ├── MobileSummaryCard.js
  ├── MobileTransactionItem.js
  └── MobileFloatingButton.js

lib/
  └── mobileHelpers.js
```

### 2. Update Page
```javascript
// 1. Import
import MobileHeader from '../components/MobileHeader'
import MobileBottomNav from '../components/MobileBottomNav'

// 2. Replace header
<div className="hidden lg:block"><Header /></div>
<MobileHeader title="Page Name" icon="📊" {...props} />

// 3. Add bottom nav
<MobileBottomNav />
```

### 3. Test
- Open in mobile viewport
- Check navigation works
- Verify touch targets
- Test dark mode
- Confirm no overflow

---

## 📱 Mobile-First Best Practices

### ✅ DO
- Use `lg:hidden` and `hidden lg:block` for responsive splits
- Start with mobile layout, enhance for desktop
- Minimum 48px touch targets
- Use semantic HTML
- Test on real devices
- Consider safe areas (notches)
- Optimize images for mobile
- Keep labels short and clear

### ❌ DON'T
- Don't rely on hover states
- Don't make text smaller than 12px
- Don't use fixed widths (use responsive)
- Don't forget landscape orientation
- Don't ignore loading states
- Don't make forms too complex
- Don't forget accessibility

---

## 🎯 Performance Tips

1. **Lazy load images**
```jsx
<img loading="lazy" src={src} alt={alt} />
```

2. **Use CSS animations over JS**
```css
transition-all duration-200
```

3. **Reduce bundle size**
```javascript
// Avoid importing entire libraries
import { specific } from 'library'
```

4. **Optimize renders**
```javascript
// Memoize expensive calculations
const stats = useMemo(() => calculateStats(data), [data])
```

---

## 📚 References

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [iOS HIG](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)
- [Web.dev Mobile UX](https://web.dev/mobile-ux/)

---

**Status**: ✅ Complete  
**Version**: 1.0.0  
**Last Updated**: January 11, 2025  
**Components**: 5 mobile components + utilities
