# Formula Popovers Implementation

This document explains the formula popover feature added to the Buy/Sell transaction table.

## Overview

The Buy/Sell component now displays **FaSquareRootVariable** icons next to computed column headers. When users hover over these icons, they see detailed formula information in a popover.

## Implemented Features

### 📊 Computed Columns with Formula Popovers

1. **Clean Price**
   - **Formula**: `100%`
   - **Description**: The price of the bond without accrued interest
   - **Variables**: Standard par value pricing

2. **Dirty Price** 
   - **Formula**: `Clean Price + Accrued Interest`
   - **Description**: Total price including accrued interest
   - **Variables**: Clean Price, Accrued Interest, Dirty Price

3. **Settlement Amount**
   - **Formula**: `(Notional × Dirty Price / 100) + Transaction Fee`
   - **Description**: Total amount for the transaction
   - **Variables**: Notional, Dirty Price, Transaction Fee, Settlement Amount

4. **Days Accrued**
   - **Formula**: `Settlement Date - Last Coupon Date`
   - **Description**: Days since last coupon payment
   - **Variables**: Settlement Date, Last Coupon Date, Days Accrued

5. **Accrued Interest**
   - **Formula**: `(Notional × Coupon Rate × Days Accrued) / (Days in Year × 100)`
   - **Description**: Interest accumulated since last coupon payment
   - **Variables**: Notional, Coupon Rate, Days Accrued, Days in Year, Accrued Interest

6. **Transaction Fee (Currency)**
   - **Formula**: `(Notional × Transaction Fee %) / 100`
   - **Description**: Fee for executing the transaction
   - **Variables**: Notional, Transaction Fee %, Transaction Fee

## Technical Implementation

### Components

1. **FormulaPopover.tsx**
   - Reusable component for displaying formula information
   - Accepts title, formula, description, and variables as props
   - Themed styling that adapts to light/dark mode
   - Uses Bootstrap's OverlayTrigger and Popover components

2. **BuySellComponent.tsx Updates**
   - Added FormulaPopover components to computed column headers
   - Each popover contains relevant mathematical formulas
   - Hover trigger for non-intrusive user experience

### Features

- **🎨 Themed UI**: Popovers adapt to current theme (light/dark mode)
- **📱 Responsive**: Works on all screen sizes
- **🔍 Hover Activation**: Shows on hover, hides automatically
- **📚 Educational**: Helps users understand financial calculations
- **⚡ Performance**: Minimal bundle size impact (+990B total)

## User Experience

### How to Use

1. **Navigate to Buy/Sell page**
2. **Look for formula icons**: 🔧 (FaSquareRootVariable) next to computed column headers
3. **Hover over icons**: Popover appears with formula details
4. **Review information**: See formula, description, and variable explanations
5. **Continue working**: Popover disappears when you move away

### Visual Design

- **Icon**: Square root variable icon in theme primary color
- **Popover**: Themed background with border
- **Formula**: Monospace font in highlighted box
- **Variables**: Bulleted list with variable definitions
- **Responsive**: Adjusts to available screen space

## Maintenance

### Adding New Formula Popovers

To add formula popovers to other columns:

```tsx
import FormulaPopover from '../common/FormulaPopover';

// In column definition:
header: () => (
    <span>
        Column Name
        <FormulaPopover
            title="Your Formula Name"
            formula="Your Mathematical Formula"
            description="Explanation of what this calculates"
            variables={{
                "Variable1": "What this represents",
                "Variable2": "What this represents"
            }}
        />
    </span>
),
```

### Customization

The FormulaPopover component accepts these props:
- `title`: String for the popover header
- `formula`: Mathematical formula as string
- `description`: Text explanation
- `variables`: Object with variable name/description pairs

## Benefits

✅ **Educational**: Users learn the financial calculations
✅ **Transparency**: Clear understanding of how values are computed  
✅ **Professional**: Enhances the application's credibility
✅ **User-Friendly**: Non-intrusive hover-based interaction
✅ **Consistent**: Unified design across all formula columns
✅ **Performant**: Minimal impact on bundle size

## Integration Status

- ✅ Clean Price formula
- ✅ Dirty Price formula  
- ✅ Settlement Amount formula
- ✅ Days Accrued formula
- ✅ Accrued Interest formula
- ✅ Transaction Fee formula
- ✅ Build successful
- ✅ No TypeScript errors
- ✅ Bundle size optimized

The formula popover feature is now fully integrated and ready for production use.
