# Mobile UI Layout Guide

## Betting User Mobile Experience (< 768px)

```
┌─────────────────────────────┐
│  🎲 Betting                  │ ← Compact Header (60px)
├─────────────────────────────┤
│                             │
│                             │
│   Main Content Area         │
│   (Scrollable)              │
│                             │
│   - Login form              │
│   - Card shop grid          │
│   - Betting tables          │
│   - Wallet details          │
│   - Leaderboard             │
│                             │
│   [80px bottom padding]     │
│                             │
├─────────────────────────────┤
│ 🛒    🎴    🎯    💰    🏆  │ ← Bottom Nav (Fixed, 60px)
│Shop  Cards Tables Wallet Board│
└─────────────────────────────┘
     👍 One-handed friendly!
```

### Bottom Navigation Details
- **Always Visible**: Fixed at bottom, doesn't scroll
- **5 Navigation Items**: 
  1. Shop (🛒) - Buy cards
  2. Cards (🎴) - View owned cards  
  3. Tables (🎯) - Active page highlight
  4. Wallet (💰) - Balance & history
  5. Board (🏆) - Leaderboard
- **Active State**: Blue top border + 1.2x scaled icon
- **Touch Target**: Each item 60px tall × screen-width/5
- **Safe Area**: Auto-adjusts for iPhone notch

## Admin User Mobile Experience (< 768px)

```
┌─────────────────────────────┐
│  ⚾ Soccer Query Admin       │ ← Header
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │  📊 Query Explorer    │  │ ← Full-width buttons
│  └───────────────────────┘  │   (44px height minimum)
│                             │
│  ┌───────────────────────┐  │
│  │  📝 My Queries        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  ❌ Exit to Betting   │  │
│  └───────────────────────┘  │
│                             │
│   Main Content Area         │
│   (Query management UI)     │
│                             │
└─────────────────────────────┘
```

## Touch Target Sizes (Apple & Google Guidelines)

```
Minimum Touch Target: 44px × 44px
Recommended: 48px × 48px

Our Implementation:
✅ Bottom nav items: 60px height
✅ Buttons: 44px+ height
✅ Form inputs: 44px+ height
✅ Navigation links: 44px height on mobile
```

## Breakpoints

```css
Desktop:   > 1024px  → Full desktop nav
Tablet:    768-1024px → Compact desktop nav  
Mobile:    < 768px   → Bottom nav (betting) / Stacked nav (admin)
```

## Mobile Optimizations Applied

### Visual Feedback
- ✅ Tap animation: Scale to 0.98x on press
- ✅ Active state: Top border + scaled icon
- ✅ Hover effect: Color change (desktop)
- ✅ No tap highlight (removed blue flash)

### Typography
- ✅ 16px minimum (prevents iOS auto-zoom)
- ✅ Scaled down headings on mobile
- ✅ Readable font sizes (0.95rem base)

### Spacing
- ✅ Larger padding on mobile (1rem → 1.5rem)
- ✅ Full-width buttons on mobile
- ✅ 80px bottom padding for bottom nav
- ✅ Safe area insets for iOS

### Performance
- ✅ GPU-accelerated animations
- ✅ Smooth scrolling on iOS
- ✅ Touch action optimized
- ✅ Minimal reflows

## Testing on Different Devices

### iPhone SE (375px wide)
```
Bottom nav: 5 items × 75px = Perfect fit
Thumb reach: ~300px from bottom = All items reachable
```

### iPhone 14 Pro Max (430px wide)
```
Bottom nav: 5 items × 86px = Comfortable spacing
Safe area: Home indicator spacing applied
```

### Android (360-400px typical)
```
Bottom nav: Scales proportionally
Navigation bar: Proper spacing applied
```

### iPad Mini (768px)
```
Breakpoint: Uses tablet layout
Navigation: Top nav with larger items
```

## User Flow Example

### New Betting User on iPhone
1. Opens app → `/betting/login`
2. Sees compact "🎲 Betting" header
3. Fills login form (16px inputs, no zoom)
4. Taps "Login" button (44px height)
5. Redirected to `/betting/shop`
6. **Bottom nav appears** - 5 icons visible
7. Taps 🛒 Shop - buys cards
8. Taps 🎴 Cards - views owned cards
9. Taps 🎯 Tables - joins betting table
10. Taps 💰 Wallet - checks balance
11. Taps 🏆 Board - views ranking

### All with one hand! 👍

## Comparison: Before vs After

### Before (Desktop-only approach)
```
Mobile Problems:
❌ Tiny navigation links
❌ Hard to tap accurately
❌ Top nav takes screen space
❌ Two-handed operation needed
❌ Lots of scrolling
```

### After (Mobile-first approach)
```
Mobile Wins:
✅ Large touch targets (60px)
✅ Easy one-handed use
✅ Fixed bottom nav (always visible)
✅ Native app feel
✅ Minimal scrolling needed
```

## Future Enhancements

1. **Pull to Refresh**: Swipe down to reload data
2. **Swipe Gestures**: Swipe between pages
3. **Haptic Feedback**: Vibration on tap (iOS)
4. **Dark Mode**: Auto-detect system preference
5. **PWA Features**: Install as app, offline mode
6. **Push Notifications**: Bet results, new matches
7. **Touch ID**: Biometric login
8. **Landscape Mode**: Optimized horizontal layout
