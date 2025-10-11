# 🌓 Dark Mode Quick Reference

## ✅ Standard Implementation (Copy & Paste)

```javascript
import { useState, useEffect } from 'react'

export default function YourPage() {
  // 1. Declare state
  const [darkMode, setDarkMode] = useState(false)

  // 2. Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved) setDarkMode(JSON.parse(saved))
  }, [])

  // 3. Save to localStorage and sync document class
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // 4. Define helper classes
  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-100'
  
  const cardBgClass = darkMode 
    ? 'bg-slate-800 border border-slate-700' 
    : 'bg-white'
  
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900'
  const labelClass = darkMode ? 'text-gray-300' : 'text-gray-700'
  
  const inputClass = darkMode 
    ? 'bg-slate-700 border-slate-600 text-white focus:ring-orange-500' 
    : 'border-gray-300 focus:ring-blue-500'

  // 5. Render with Header
  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
      <Header 
        title="Your Page"
        subtitle="Description"
        icon="📊"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showDarkModeToggle={true}
      />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className={cardBgClass}>
          <h2 className={textClass}>Your Content</h2>
        </div>
      </div>
    </div>
  )
}
```

## 🎨 Common Dark Mode Classes

### Background Colors:
```javascript
// Page background
darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
         : 'bg-gradient-to-br from-blue-50 to-indigo-100'

// Card/Panel background
darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'

// Hover states
darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
```

### Text Colors:
```javascript
// Primary text
darkMode ? 'text-gray-100' : 'text-gray-900'
darkMode ? 'text-white' : 'text-gray-900'

// Secondary text
darkMode ? 'text-gray-300' : 'text-gray-600'
darkMode ? 'text-gray-400' : 'text-gray-500'

// Label text
darkMode ? 'text-gray-300' : 'text-gray-700'

// Accent text
darkMode ? 'text-orange-400' : 'text-orange-600'
darkMode ? 'text-blue-400' : 'text-blue-600'
```

### Input Fields:
```javascript
darkMode 
  ? 'bg-slate-700 border-slate-600 text-white focus:ring-orange-500 focus:border-orange-500' 
  : 'border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
```

### Buttons:
```javascript
// Primary button
darkMode 
  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
  : 'bg-blue-600 hover:bg-blue-700 text-white'

// Secondary button
darkMode 
  ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600' 
  : 'bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-300'

// Danger button
darkMode 
  ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400' 
  : 'bg-red-50 hover:bg-red-100 text-red-600'
```

### Tables:
```javascript
// Table header
darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-50 text-gray-700'

// Table row hover
darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'

// Border
darkMode ? 'border-slate-700' : 'border-gray-200'
```

## 📋 Checklist for New Pages

- [ ] Add `const [darkMode, setDarkMode] = useState(false)`
- [ ] Add load useEffect with localStorage
- [ ] Add save useEffect with localStorage + document.documentElement
- [ ] Define helper classes (bgClass, cardBgClass, textClass, etc.)
- [ ] Update Header props: `darkMode={darkMode}` `setDarkMode={setDarkMode}` `showDarkModeToggle={true}`
- [ ] Apply background class to main container
- [ ] Apply card class to panels
- [ ] Apply text classes to headings and labels
- [ ] Apply input classes to form fields
- [ ] Test toggle functionality
- [ ] Test page navigation (dark mode should persist)
- [ ] Test browser refresh (dark mode should persist)

## 🔍 Current Status - All Pages

| Page | Dark Mode | localStorage | document.classList | Status |
|------|-----------|--------------|-------------------|--------|
| index.js | ✅ | ✅ | ✅ | Complete |
| expenses.js | ✅ | ✅ | ✅ | Complete |
| debts.js | ✅ | ✅ | ✅ | Complete |
| recurring.js | ✅ | ✅ | ✅ | Complete |
| budget-dashboard.js | ✅ | ✅ | ✅ | Complete |
| transaction-history.js | ✅ | ✅ | ✅ | Complete |
| dashboard-advanced.js | ✅ | ✅ | ✅ | Complete |

## 🚫 Common Mistakes to Avoid

### ❌ Don't:
```javascript
// Don't use toString()
localStorage.setItem('darkMode', darkMode.toString())

// Don't forget document.documentElement
useEffect(() => {
  localStorage.setItem('darkMode', JSON.stringify(darkMode))
  // Missing: document.documentElement.classList...
}, [darkMode])

// Don't hardcode props
<Header darkMode={false} setDarkMode={null} />

// Don't use inline conditions everywhere
<div className={darkMode ? 'bg-dark text-white' : 'bg-light text-black'}>
```

### ✅ Do:
```javascript
// Use JSON.stringify/parse
localStorage.setItem('darkMode', JSON.stringify(darkMode))

// Always sync document.documentElement
useEffect(() => {
  localStorage.setItem('darkMode', JSON.stringify(darkMode))
  if (darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [darkMode])

// Pass state and setter
<Header darkMode={darkMode} setDarkMode={setDarkMode} showDarkModeToggle={true} />

// Use helper variables
const textClass = darkMode ? 'text-white' : 'text-black'
<div className={textClass}>
```

## 🎯 Testing Commands

```bash
# Check localStorage in browser console
localStorage.getItem('darkMode')  // Should be "true" or "false"

# Check document class
document.documentElement.classList.contains('dark')  // Should match darkMode state

# Clear dark mode (for testing)
localStorage.removeItem('darkMode')
```

## 📚 Related Files

- `/components/Header.js` - Contains dark mode toggle in user menu
- `/pages/*.js` - All pages implement dark mode
- `/DARK_MODE_SYNC_COMPLETE.md` - Full documentation

---
**Updated:** October 11, 2025  
**All Pages:** ✅ 7/7 Complete
