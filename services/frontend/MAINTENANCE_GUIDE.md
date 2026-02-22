# Maintenance Mode - Quick Start Guide

Your maintenance mode system is now fully integrated and ready to use! Here's how to enable and disable it safely.

## ✅ How to Enable Maintenance Mode

### Method 1: Environment Variable (Recommended for Production)
1. Add to your `.env` file:
   ```
   REACT_APP_MAINTENANCE_MODE=true
   ```
2. Restart your application

### Method 2: Browser Console (Quick Testing)
Open browser console and run:
```javascript
localStorage.setItem('maintenanceMode', 'true');
window.location.reload();
```

### Method 3: Use the Admin Control Component
Add the `MaintenanceControl` component to your settings page for a UI toggle.

## ✅ How to Disable Maintenance Mode

### Method 1: Environment Variable
1. Change your `.env` file:
   ```
   REACT_APP_MAINTENANCE_MODE=false
   ```
2. Restart your application

### Method 2: Browser Console
Open browser console and run:
```javascript
localStorage.removeItem('maintenanceMode');
window.location.reload();
```

## ✅ Testing Your Setup

1. **Test the pages work:**
   - Visit `/maintenance` (maintenance page with layout)
   - Visit `/maintenance-mode` (standalone maintenance page)

2. **Test the redirect:**
   ```javascript
   // Enable maintenance
   localStorage.setItem('maintenanceMode', 'true');
   window.location.reload();
   // Should redirect to /maintenance-mode
   ```

3. **Test the disable:**
   ```javascript
   // Disable maintenance
   localStorage.removeItem('maintenanceMode');
   window.location.reload();
   // Should return to normal operation
   ```

## ✅ What Happens When Enabled

- All users are automatically redirected to `/maintenance-mode`
- The standalone maintenance page shows (no navbar/sidebar)
- Exempt paths like `/maintenance-mode` and `/maintenance` remain accessible
- Your existing app structure is preserved

## ✅ Safe Operation

- Your product won't break - all existing routes work normally when maintenance is disabled
- The MaintenanceGuard only activates when maintenance mode is explicitly enabled
- No changes to your existing authentication or protected routes
- Easy to revert by simply disabling maintenance mode

## ✅ Files Added/Modified

**New Files:**
- `src/utils/maintenanceMode.ts` - Maintenance utilities
- `src/components/MaintenanceControl.tsx` - Admin toggle component
- `src/pages/MaintenancePage.tsx` - Maintenance page with layout
- `src/pages/StandaloneMaintenancePage.tsx` - Full-screen maintenance page

**Modified Files:**
- `src/App.tsx` - Added MaintenanceGuard wrapper
- `src/components/MaintenanceGuard.tsx` - Updated to use new utilities

Your product is now maintenance-ready without any breaking changes! 🎉
