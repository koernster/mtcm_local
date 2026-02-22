# Buy/Sell Component Architecture

The Buy/Sell functionality has been divided into several reusable components based on their usage and responsibilities.

## Recent Fixes Applied

### Expandable Row Feature
- **Feature**: Added expandable rows within the transaction table
- **Implementation**: Each transaction row now has an expand/collapse button
- **Details**: Expanded rows show additional editable fields (Counterparty, Bank/Investor, Reference, Sales)
- **Validation**: All expandable fields have a 55-character limit
- **Integration**: Fully integrated with Redux store for real-time updates

### Redux Store Integration Fix
- **Issue**: Values were not updating back to Redux store when adding new entries
- **Solution**: Integrated new row properly with TanStack React Table system instead of manual rendering
- **Result**: All field changes now properly propagate to Redux store through normal flow

### TypeError Fix  
- **Issue**: `getValue().toFixed is not a function` error when clicking "Add New"
- **Solution**: Enhanced getValue function to return appropriate defaults (0 for numeric fields, '' for text fields)
- **Result**: No more runtime errors, proper handling of empty/undefined values

## Component Structure

### 1. `BuySellComponent` (Main Container)
- **Purpose**: Main orchestrating component that manages state and data flow
- **Responsibilities**:
  - Redux state management (transactions, selectedIsin)
  - Business logic for calculations
  - Event handlers for field changes
  - Data transformation and validation

### 2. `ISINInfoCard`
- **Purpose**: Display ISIN information in a card format
- **Responsibilities**:
  - Show ISIN details (ISIN number, currency, dates, rates)
  - Provide a clean, reusable interface for bond information
- **Props**: `isinInfo` object containing bond details

### 3. `TransactionControls`
- **Purpose**: Header controls for the transaction table
- **Responsibilities**:
  - Search functionality
  - Transaction count display
  - Sort controls (Clear Sort button)
  - Coupon dates button integration
- **Props**: Transaction count, sorting state, coupon dates

### 4. `TransactionTable`
- **Purpose**: Reusable data table with sorting, filtering, and expandable rows
- **Responsibilities**:
  - Render transaction data in table format
  - Handle sorting and filtering
  - Manage table interactions (clicks, hover states)
  - Support expandable rows for additional transaction details
- **Props**: Data, columns, sorting/filtering state, field change handlers
- **Features**:
  - **Expandable Rows**: Each transaction row can be expanded to show additional fields:
    - Counterparty (max 55 chars)
    - Bank/Investor (max 55 chars) 
    - Reference (max 55 chars)
    - Sales (max 55 chars)
  - **Expand/Collapse Control**: Arrow button to toggle row expansion
  - **Inline Editing**: All fields in expanded rows are editable with real-time updates

### 5. `CouponDatesButton`
- **Purpose**: Button with popover showing coupon payment dates
- **Responsibilities**:
  - Display calendar icon and button
  - Show/hide popover with coupon dates
  - Format dates for display
- **Props**: Coupon dates array, show/hide state

### 6. `TransactionColumns` (Configuration)
- **Purpose**: Column definitions for the transaction table
- **Responsibilities**:
  - Define all table columns with their properties
  - Include formula popovers for computed columns
  - Handle cell rendering and interactions
  - Define expand/collapse column for row expansion
- **Exports**: `createTransactionColumns` function
- **Features**:
  - **Expand Column**: First column with arrow button for row expansion
  - **Editable Cells**: All input fields properly integrated with Redux
  - **Formula Tooltips**: Computed fields have informative popovers

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Each component has a single, well-defined responsibility
- Business logic is separated from UI presentation
- Data flow is clear and predictable

### 2. **Reusability**
- `ISINInfoCard` can be used in other parts of the application
- `TransactionTable` can be reused for other transaction types
- `CouponDatesButton` can be used wherever coupon information is needed

### 3. **Maintainability**
- Changes to one component don't affect others
- Easy to test individual components
- Clear component boundaries make debugging easier

### 4. **Flexibility**
- Components can be easily extended or modified
- New features can be added without affecting existing code
- Easy to customize appearance or behavior per use case

## Usage Examples

### Basic Usage
```tsx
import { BuySellComponent } from './components/buysell';

function App() {
  return <BuySellComponent />;
}
```

### Using Individual Components
```tsx
import { 
  ISINInfoCard, 
  TransactionControls, 
  TransactionTable 
} from './components/buysell';

function CustomTransactionView({ isinInfo, transactions }) {
  return (
    <div>
      <ISINInfoCard isinInfo={isinInfo} />
      <TransactionControls 
        transactionCount={transactions.length}
        // ... other props
      />
      <TransactionTable 
        data={transactions}
        // ... other props
      />
    </div>
  );
}
```

## Component Dependencies

```
BuySellComponent (Main)
├── ISINInfoCard
├── TransactionControls
│   └── CouponDatesButton
├── TransactionTable (with expandable rows)
│   ├── Expand/Collapse Controls
│   └── Expandable Row Content (Counterparty, Bank/Investor, Reference, Sales)
└── TransactionColumns (configuration with expand column)
```

## Future Extensions

This architecture makes it easy to add new features:
- **Different Transaction Types**: Create new column configurations
- **Export Functionality**: Add export buttons to `TransactionControls`
- **Bulk Operations**: Extend `TransactionTable` with selection capabilities
- **Custom Filters**: Add filter components to `TransactionControls`
- **Real-time Updates**: Add websocket integration to main component

## File Structure

```
components/buysell/
├── index.ts                    # Main export file
├── BuySellComponent.tsx        # Main container component
├── ISINInfoCard.tsx           # ISIN information display
├── TransactionControls.tsx    # Header controls
├── TransactionTable.tsx       # Data table component
├── CouponDatesButton.tsx      # Coupon dates popover
└── TransactionColumns.tsx     # Column definitions
```
