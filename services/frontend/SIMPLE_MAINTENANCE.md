# Simple Maintenance Mode 🔧

Your maintenance system is now super simple with just one centered maintenance page!

## ✅ How It Works

- **One Page**: Just `/maintenance` - simple and clean
- **Centered Design**: Clean card in the center of the screen
- **Theme-Integrated**: Uses your existing dark theme
- **Animated Icon**: Rotating tools icon with FontAwesome

## ✅ How to Enable/Disable

### Quick Test (Enable):
```javascript
localStorage.setItem('maintenanceMode', 'true');
window.location.reload();
```

### Quick Test (Disable):
```javascript
localStorage.removeItem('maintenanceMode');
window.location.reload();
```

### Production (Enable):
Add to `.env` file:
```
REACT_APP_MAINTENANCE_MODE=true
```

### Production (Disable):
Change `.env` file:
```
REACT_APP_MAINTENANCE_MODE=false
```

## ✅ What Happens

- When enabled: All users redirect to `/maintenance`
- Clean, simple maintenance page shows
- Your app is protected until you disable it

## ✅ Files

**Created:**
- `src/pages/StandaloneMaintenancePage.tsx` - Simple maintenance page
- `src/utils/maintenanceMode.ts` - Maintenance utilities
- `src/components/MaintenanceGuard.tsx` - Auto-redirect protection

**Updated:**
- `src/App.tsx` - Single maintenance route

That's it! Simple, clean, and effective! 🎉
