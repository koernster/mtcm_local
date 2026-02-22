# Case Status Management

This document describes the common logic for determining case status and functionality availability based on compartment status.

## Overview

The case status management system provides a centralized way to determine what functionality is available based on the case's current compartment status. The system handles three key states with specific behaviors:

1. **CASE_FREEZED (10)**: ISIN can be edited, other fields locked
2. **SUBSCRIPTION (8)**: ISIN cannot be edited, subscriptions accepted  
3. **ISSUED (9)**: Entire compartment is read-only

## Key Components

### 1. Case Status Utilities (`/utils/caseStatusUtils.ts`)

#### Primary Functions

- **`isCaseFreezedOrLocked(caseData)`**: Checks if case is in any restricted state
- **`isCaseFreezed(caseData)`**: Checks if case is in CASE_FREEZED state (ISIN editable)
- **`isCaseInSubscription(caseData)`**: Checks if case is accepting subscriptions
- **`isCaseIssued(caseData)`**: Checks if case is issued (completely readonly)

#### Functionality Functions

- **`canEditIsin(caseData)`**: Returns true only when compartmentstatusid === CASE_FREEZED
- **`canAcceptSubscriptions(caseData)`**: Returns true only when compartmentstatusid === SUBSCRIPTION
- **`isGeneralEditingDisabled(caseData)`**: Returns true for SUBSCRIPTION and ISSUED states
- **`isFunctionalityDisabled(caseData, functionality)`**: Granular functionality checks

#### Status Logic

The system is based **exclusively** on `compartmentstatusid`:

```typescript
switch (caseData.compartmentstatusid) {
    case CompartmentStatus.CASE_FREEZED:   // ISIN editable only
    case CompartmentStatus.SUBSCRIPTION:   // ISIN locked, subscriptions open  
    case CompartmentStatus.ISSUED:         // Completely read-only
}
```

### 2. Custom Hook (`/hooks/useCaseStatus.ts`)

The `useCaseStatus` hook provides an easy way for components to access case status information:

```tsx
const {
    caseData,
    isCaseFreezedOrLocked,
    isCaseFreezed,
    isCaseInSubscription,
    isCaseIssued,
    canEditIsin,
    canAcceptSubscriptions,
    isGeneralEditingDisabled,
    getCaseLockReason,
    isFunctionalityDisabled
} = useCaseStatus();
```

## Compartment Status Behavior

### CASE_FREEZED (10) - ISIN Setup Phase
- ✅ **ISIN editing allowed** - Users can setup ISINs
- ❌ **General form editing disabled** - Product setup fields locked  
- 📝 **Message**: "Product setup is frozen. Only ISIN setup is allowed."

### SUBSCRIPTION (8) - Accepting Subscriptions
- ❌ **ISIN editing disabled** - ISIN setup is locked
- ❌ **General form editing disabled** - All setup fields locked
- ✅ **Subscriptions accepted** - Ready to accept investor subscriptions
- 📝 **Message**: "Case is accepting subscriptions. ISIN setup is locked."

### ISSUED (9) - Complete Read-Only
- ❌ **All editing disabled** - Entire compartment is read-only
- ❌ **Submissions disabled** - No changes allowed
- 📝 **Message**: "Case has been issued and is completely read-only."

## Functionality Matrix

| Status | General Edit | ISIN Edit | Delete | Submit | Subscriptions |
|--------|-------------|-----------|--------|--------|---------------|
| Normal | ✅ | ❌ | ✅ | ✅ | ❌ |
| CASE_FREEZED | ❌ | ✅ | ❌ | ✅ | ❌ |
| SUBSCRIPTION | ❌ | ❌ | ❌ | ✅ | ✅ |
| ISSUED | ❌ | ❌ | ❌ | ❌ | ❌ |

## Usage Examples

### Basic Status Check

```tsx
import { useCaseStatus } from '../hooks/useCaseStatus';

const MyComponent = () => {
    const { isCaseFreezed, isGeneralEditingDisabled } = useCaseStatus();
    
    return (
        <input 
            disabled={isGeneralEditingDisabled}
            // ... other props
        />
    );
};
```

### ISIN Editing Specific

```tsx
import { useCaseStatus } from '../hooks/useCaseStatus';

const ISINComponent = () => {
    const { canEditIsin, getCaseLockReason } = useCaseStatus();
    
    if (!canEditIsin) {
        return <div className="alert alert-warning">{getCaseLockReason()}</div>;
    }
    
    return <ISINEditor />;
};
```

### Subscription Management

```tsx
import { useCaseStatus } from '../hooks/useCaseStatus';

const SubscriptionComponent = () => {
    const { canAcceptSubscriptions, isCaseInSubscription } = useCaseStatus();
    
    return (
        <div>
            {canAcceptSubscriptions && <SubscriptionForm />}
            {isCaseInSubscription && <div>Now accepting subscriptions!</div>}
        </div>
    );
};
```

### Granular Functionality Control

```tsx
import { useCaseStatus } from '../hooks/useCaseStatus';

const ActionButtons = () => {
    const { isFunctionalityDisabled } = useCaseStatus();
    
    const canEdit = !isFunctionalityDisabled('edit');
    const canDelete = !isFunctionalityDisabled('delete');
    const canEditIsin = !isFunctionalityDisabled('isin_edit');
    
    return (
        <div>
            <button disabled={!canEdit}>Edit General</button>
            <button disabled={!canDelete}>Delete</button>
            <button disabled={!canEditIsin}>Edit ISIN</button>
        </div>
    );
};
```

### Direct Utility Usage

```tsx
import { canEditIsin, isGeneralEditingDisabled } from '../utils/caseStatusUtils';

const MyComponent = ({ caseData }) => {
    const isinEditable = canEditIsin(caseData);
    const generalDisabled = isGeneralEditingDisabled(caseData);
    
    // ... component logic
};
```

## Compartment Status States

### CompartmentStatus.CASE_FREEZED (10)
**Purpose**: ISIN setup phase
- **ISIN Editing**: ✅ Allowed (only state where ISIN can be edited)
- **General Editing**: ❌ Disabled  
- **Subscriptions**: ❌ Not accepting
- **Use Case**: Setting up ISINs after product setup is complete

### CompartmentStatus.SUBSCRIPTION (8)  
**Purpose**: Subscription acceptance phase
- **ISIN Editing**: ❌ Locked (ISINs are finalized)
- **General Editing**: ❌ Disabled
- **Subscriptions**: ✅ Accepting subscriptions
- **Use Case**: Collecting investor subscriptions

### CompartmentStatus.ISSUED (9)
**Purpose**: Final issued state
- **ISIN Editing**: ❌ Locked
- **General Editing**: ❌ Disabled  
- **Subscriptions**: ❌ Closed
- **All Operations**: ❌ Read-only
- **Use Case**: Compartment has been issued and is archived

## Key Design Principles

1. **Single Source of Truth**: Only `compartmentstatusid` determines behavior
2. **Exclusive ISIN Editing**: ISINs can only be edited in CASE_FREEZED state
3. **Progressive Restrictions**: Each state becomes more restrictive
4. **Clear State Transitions**: CASE_FREEZED → SUBSCRIPTION → ISSUED

## Migration Guide

### Replacing Existing Code

**Before:**
```tsx
const isCaseFreezed = caseData?.productsetupstatusid === CompartmentStatus.CASE_FREEZED;
```

**After:**
```tsx
const { isCaseFreezed } = useCaseStatus();
```

**Or using utilities directly:**
```tsx
import { isCaseFreezedOrLocked } from '../utils/caseStatusUtils';
const isCaseFreezed = isCaseFreezedOrLocked(caseData);
```

### Benefits of Migration

1. **Centralized Logic**: All freeze logic in one place
2. **Consistency**: Same behavior across all components
3. **Extensibility**: Easy to add new freeze conditions
4. **Type Safety**: Better TypeScript support
5. **Maintainability**: Easier to update freeze logic globally

## Best Practices

1. **Use the Hook**: Prefer `useCaseStatus()` in React components
2. **Check Specific Functionality**: Use `isFunctionalityDisabled()` for granular control
3. **Show User Feedback**: Use `getCaseLockReason()` to inform users why actions are disabled
4. **Consistent Naming**: Use `isCaseFreezed` for consistency with existing code

## Testing

When testing components that use case status:

```tsx
// Mock the hook
jest.mock('../hooks/useCaseStatus', () => ({
    useCaseStatus: () => ({
        isCaseFreezed: true,
        getCaseLockReason: () => 'Test reason',
        // ... other properties
    })
}));
```

## Components Updated

The following components have been updated to use the new common logic:

1. `BasicProductInfo.tsx`
2. `CaseManagementPage.tsx`

### Components That Should Be Updated

The following components still use the old logic and should be migrated:

1. `FeesAndCosts.tsx`
2. `FinStructureDetails.tsx` 
3. `KeyDatesSchedules.tsx`
4. `PartiesInvolved.tsx`
5. `DocumentArchive.tsx`
6. `ProductSetup.tsx`

## Future Enhancements

1. **Validation Integration**: Integrate with form validation to provide better error messages
2. **Permission System**: Extend to handle role-based permissions
3. **Audit Trail**: Track when and why cases are locked/unlocked
4. **Batch Operations**: Handle multiple cases at once
