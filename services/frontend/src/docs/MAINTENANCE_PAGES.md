# Maintenance Pages Documentation

This project includes comprehensive maintenance page functionality with two different maintenance page options and utility functions to manage maintenance mode.

## Files Created

### 1. Maintenance Pages
- `src/pages/MaintenancePage.tsx` - Maintenance page with app layout (navbar/sidebar)
- `src/pages/StandaloneMaintenancePage.tsx` - Full-screen maintenance page (no layout)

### 2. Utility Functions
- `src/lib/maintenanceMode.ts` - Maintenance mode utilities and configuration
- `src/components/MaintenanceGuard.tsx` - Auto-redirect component for maintenance mode
- `src/components/MaintenanceStatus.tsx` - Admin status component

## Usage

### Access Maintenance Pages

1. **Within App Layout**: Navigate to `/maintenance`
   - Shows maintenance page with navigation
   - Good for partial maintenance or when some features are still available

2. **Standalone Mode**: Navigate to `/maintenance-mode`
   - Full-screen maintenance page with no navigation
   - Good for complete system maintenance

### Enable Automatic Maintenance Mode

#### Method 1: Environment Variable
Set the environment variable in your `.env` file:
```bash
REACT_APP_MAINTENANCE_MODE=true
```

#### Method 2: Manual Override (Development)
Edit `src/lib/maintenanceMode.ts`:
```typescript
const MANUAL_MAINTENANCE_OVERRIDE = true; // Change to true
```

When maintenance mode is enabled:
- All routes automatically redirect to `/maintenance-mode`
- Exempt paths (like `/maintenance`, `/health`) remain accessible

### Display Maintenance Status (Admin)
Add the MaintenanceStatus component to any admin page:
```tsx
import MaintenanceStatus from '../components/MaintenanceStatus';

function AdminPage() {
  return (
    <div>
      <MaintenanceStatus />
      {/* other admin content */}
    </div>
  );
}
```

## Features

### Design Features
- **Theme Integration**: Both pages use your existing dark/light theme
- **FontAwesome Icons**: Multiple animated icons (tools, cogs, warning, clock, etc.)
- **Responsive Design**: Works on all screen sizes
- **Animations**: 
  - Rotating tools and cogs
  - Pulsing warning icons
  - Progress bar animation
  - Hover effects

### Functional Features
- **Two Page Types**: Layout-included and standalone options
- **Auto-redirect**: Automatic maintenance mode redirection
- **Contact Information**: Support email and phone display
- **Progress Indicator**: Visual maintenance progress
- **Navigation**: "Go Back" functionality
- **Status Monitoring**: Admin-friendly status component

### Styling
- Uses your existing theme colors:
  - Dark theme: Navy blues (#0D1B2A, #1B263B, #778DA9)
  - Light theme: Light grays and blues
- Consistent with your app's border radius, spacing, and typography
- Smooth transitions and hover effects
- Professional, modern appearance

## Customization

### Update Contact Information
Edit `src/lib/maintenanceMode.ts`:
```typescript
export const getMaintenanceStatus = () => {
  return {
    // ... other properties
    contactEmail: 'your-support@domain.com',
    contactPhone: '+1 (555) YOUR-NUMBER'
  };
};
```

### Modify Maintenance Content
Edit the content in either maintenance page component:
- Update titles, descriptions, and feature lists
- Change estimated completion times
- Modify progress percentages
- Add/remove FontAwesome icons

### Add More Exempt Paths
Edit `src/lib/maintenanceMode.ts`:
```typescript
export const MAINTENANCE_EXEMPT_PATHS = [
  '/maintenance',
  '/maintenance-mode',
  '/health',
  '/status',
  '/admin/emergency' // Add your paths here
];
```

## Integration with Existing App

The maintenance pages are already integrated into your `App.tsx`:
- Routes are properly configured
- Theme context is available
- Navigation works correctly
- No additional setup required

Just navigate to `/maintenance` or `/maintenance-mode` to see the pages in action!

## Quick Testing

1. Navigate to `http://localhost:3000/maintenance`
2. Navigate to `http://localhost:3000/maintenance-mode`
3. Set `MANUAL_MAINTENANCE_OVERRIDE = true` to test auto-redirect
4. Check that all icons are animating and styles match your theme
