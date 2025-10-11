# 📐 Header Component Architecture

## 🏗️ Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Header Component                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Logo + Title                 Dark Mode + User + Auth   │ │
│  │  ┌───────┐  ┌────────────┐   ┌────┐ ┌──────┐ ┌──────┐ │ │
│  │  │  📊  │  │ Page Title │   │ 🌙 │ │ 👤  │ │ 🚪  │ │ │
│  │  └───────┘  └────────────┘   └────┘ └──────┘ └──────┘ │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Navigation (Desktop)                              │ │ │
│  │  │  📊 Dashboard | 📋 Ngân sách | 💰 Chi tiêu ...   │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Mobile Navigation (< 1024px)                           │ │
│  │  [📊 Dashboard] [📋 Ngân sách] [💰 Chi tiêu] → scroll  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌──────────────┐
│   Page       │
│  Component   │
└──────┬───────┘
       │ Props:
       │ - title
       │ - subtitle
       │ - icon
       │ - darkMode
       │ - setDarkMode
       ↓
┌──────────────┐
│   Header     │
│  Component   │
└──────┬───────┘
       │
       ├─→ useSession() ──→ User Info
       │
       ├─→ useRouter() ──→ Active State
       │
       └─→ signOut() ──→ Authentication
```

## 📂 File Organization

```
Financial-Management-Application/
│
├── components/
│   ├── Header.js              ← 🆕 New component
│   ├── Header.README.md       ← 🆕 Documentation
│   ├── Footer.js
│   └── Notification.js
│
├── pages/
│   ├── index.js               ← ✏️ Updated
│   ├── expenses.js            ← ✏️ Updated
│   ├── debts.js               ← ✏️ Updated
│   ├── recurring.js           ← ✏️ Updated
│   ├── budget-dashboard.js    ← ✏️ Updated
│   ├── transaction-history.js ← ✏️ Updated
│   └── dashboard-advanced.js  ← ✏️ Updated
│
└── docs/
    ├── HEADER_SYNC_COMPLETE.md
    └── GIT_COMMIT_SUMMARY.md
```

## 🎨 Component Hierarchy

```
App
│
├── Page Component (index.js, expenses.js, etc.)
│   │
│   ├── Header Component ← Shared across all pages
│   │   │
│   │   ├── Logo & Title Section
│   │   │   ├── Icon
│   │   │   └── Title + Subtitle
│   │   │
│   │   ├── Navigation Section
│   │   │   ├── Desktop Nav (inline)
│   │   │   └── Mobile Nav (below)
│   │   │
│   │   └── Actions Section
│   │       ├── Dark Mode Toggle
│   │       ├── User Info
│   │       └── Auth Buttons
│   │
│   ├── Notification Component
│   │
│   ├── Page Content
│   │
│   └── Footer Component
```

## 🔀 Navigation Flow

```
┌─────────────┐
│  Dashboard  │ ←─┐
└──────┬──────┘   │
       │          │
       ├─→ 📋 Budget Dashboard
       │          │
       ├─→ 💰 Expenses
       │          │
       ├─→ 📝 Debts
       │          │
       ├─→ 🔄 Recurring
       │          │
       ├─→ 📜 Transaction History
       │          │
       └─→ 🚀 Advanced Dashboard
                  │
                  └──────┘
```

## 📱 Responsive Breakpoints

```
┌─────────────────────────────────────────┐
│  Desktop (≥ 1024px)                     │
│  ┌────────────────────────────────┐    │
│  │ Logo + Title | Nav | Actions   │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Mobile (< 1024px)                      │
│  ┌────────────────────────────────┐    │
│  │ Logo + Title | Actions         │    │
│  ├────────────────────────────────┤    │
│  │ [Nav] [Items] [Scroll] →       │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## 🎭 State Management

```
┌────────────────────────────┐
│  Parent Page Component     │
│  ┌──────────────────────┐  │
│  │  State:              │  │
│  │  - darkMode          │  │
│  │  - setDarkMode       │  │
│  └──────────┬───────────┘  │
│             │              │
│             ↓ Props        │
│  ┌──────────────────────┐  │
│  │  Header Component    │  │
│  │  - Receives props    │  │
│  │  - Calls setDarkMode │  │
│  └──────────────────────┘  │
└────────────────────────────┘

┌────────────────────────────┐
│  NextAuth Session          │
│  ┌──────────────────────┐  │
│  │  useSession()        │  │
│  │  - User info         │  │
│  │  - Authentication    │  │
│  └──────────┬───────────┘  │
│             │              │
│             ↓ Used by      │
│  ┌──────────────────────┐  │
│  │  Header Component    │  │
│  │  - Display user      │  │
│  │  - Show/hide login   │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

## 🎨 Styling Architecture

```
Header Component
│
├── Background
│   ├── Light: gradient-to-r from-[#1B3C53] via-[#234C6A] to-[#1B3C53]
│   └── Dark:  gradient-to-r from-slate-900 via-slate-800 to-slate-900
│
├── Navigation Items
│   ├── Active:   bg-[#456882] border-[#D2C1B6] shadow-lg
│   └── Inactive: bg-white/5 hover:bg-white/10
│
├── Dark Mode Toggle
│   ├── Light Mode: from-indigo-500 to-purple-600
│   └── Dark Mode:  from-yellow-400 to-orange-400
│
└── User Section
    ├── Avatar: ring-[#D2C1B6]
    └── Container: bg-white/5 border-white/10
```

## 🔍 Active State Detection

```javascript
useRouter() 
    ↓
Current Path (e.g., "/expenses")
    ↓
Compare with navItems[].href
    ↓
Match? 
    ├─ Yes → Apply active styles
    └─ No  → Apply inactive styles
```

## 🚀 Performance Optimization

```
┌────────────────────────────┐
│  Single Header Component   │
│  (Loaded once)             │
└────────┬───────────────────┘
         │
         ├─→ Page 1 (index.js)
         ├─→ Page 2 (expenses.js)
         ├─→ Page 3 (debts.js)
         ├─→ Page 4 (recurring.js)
         ├─→ Page 5 (budget-dashboard.js)
         ├─→ Page 6 (transaction-history.js)
         └─→ Page 7 (dashboard-advanced.js)

Benefits:
✅ Reduced code duplication (~500 lines)
✅ Faster bundle size
✅ Better caching
✅ Easier maintenance
```

## 🎯 Future Enhancements

```
Current Header
    ↓
    ├─→ Add Breadcrumb Navigation
    ├─→ Add Search Functionality
    ├─→ Add Notifications Dropdown
    ├─→ Add Profile Menu
    ├─→ Add Keyboard Shortcuts
    └─→ Add Multi-language Support
```

---

**Diagram Version**: 1.0  
**Last Updated**: 11/10/2025
