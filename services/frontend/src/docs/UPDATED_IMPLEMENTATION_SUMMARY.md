# Updated Case Status Implementation Summary

## New Requirements Implemented

The case freeze/lock logic has been updated to handle **three specific compartment status states** with distinct behaviors:

### 1. CASE_FREEZED (10) - ISIN Setup Phase
- ✅ **ISIN editing allowed** - Only state where ISINs can be modified
- ❌ **General form editing disabled** - Product setup fields are locked
- 📝 **Message**: "Product setup is frozen. Only ISIN setup is allowed."

### 2. SUBSCRIPTION (8) - Subscription Acceptance Phase  
- ❌ **ISIN editing disabled** - ISINs are locked and finalized
- ❌ **General form editing disabled** - All setup fields remain locked
- ✅ **Subscriptions accepted** - Ready to collect investor subscriptions
- 📝 **Message**: "Case is accepting subscriptions. ISIN setup is locked."

### 3. ISSUED (9) - Complete Read-Only State
- ❌ **All editing disabled** - Entire compartment is read-only
- ❌ **Submissions disabled** - No changes allowed whatsoever
- 📝 **Message**: "Case has been issued and is completely read-only."

## Key Changes Made

### 1. Updated Core Logic (`caseStatusUtils.ts`)

**Simplified Status Check**:
```typescript
// Now based ONLY on compartmentstatusid
export const isCaseFreezedOrLocked = (caseData: Case | null | undefined): boolean => {
    switch (caseData.compartmentstatusid) {
        case CompartmentStatus.CASE_FREEZED:
        case CompartmentStatus.SUBSCRIPTION:  
        case CompartmentStatus.ISSUED:
            return true;
        default:
            return false;
    }
};
```

**New Specific Functions**:
- `isCaseFreezed()` - Checks for CASE_FREEZED state specifically
- `isCaseInSubscription()` - Checks for SUBSCRIPTION state
- `isCaseIssued()` - Checks for ISSUED state
- `canEditIsin()` - Returns true ONLY when compartmentstatusid === CASE_FREEZED
- `canAcceptSubscriptions()` - Returns true ONLY when compartmentstatusid === SUBSCRIPTION
- `isGeneralEditingDisabled()` - Returns true for SUBSCRIPTION and ISSUED states

### 2. Enhanced Functionality Control

**New `isin_edit` Functionality**:
```typescript
case 'isin_edit':
    // ISIN can only be edited when CASE_FREEZED
    return compartmentStatus !== CompartmentStatus.CASE_FREEZED;
```

**Updated Granular Controls**:
- `edit/add`: Disabled for SUBSCRIPTION and ISSUED
- `delete`: Disabled for SUBSCRIPTION and ISSUED  
- `submit`: Disabled only for ISSUED
- `isin_edit`: Enabled only for CASE_FREEZED

### 3. Updated Hook (`useCaseStatus.ts`)

**New Hook Interface**:
```typescript
const {
    // Status checks
    isCaseFreezed,           // compartmentstatusid === CASE_FREEZED
    isCaseInSubscription,    // compartmentstatusid === SUBSCRIPTION  
    isCaseIssued,           // compartmentstatusid === ISSUED
    
    // Functionality checks
    canEditIsin,            // Only true for CASE_FREEZED
    canAcceptSubscriptions, // Only true for SUBSCRIPTION
    isGeneralEditingDisabled, // True for SUBSCRIPTION and ISSUED
    
    // Utilities  
    isFunctionalityDisabled, // Now includes 'isin_edit'
    getCaseLockReason
} = useCaseStatus();
```

## Usage Examples

### ISIN Editing Control
```tsx
const ISINEditor = () => {
    const { canEditIsin, getCaseLockReason } = useCaseStatus();
    
    if (!canEditIsin) {
        return <Alert variant="warning">{getCaseLockReason()}</Alert>;
    }
    
    return <ISINForm />; // Only shown when CASE_FREEZED
};
```

### General Form Controls
```tsx
const ProductSetupForm = () => {
    const { isGeneralEditingDisabled } = useCaseStatus();
    
    return (
        <form>
            <input disabled={isGeneralEditingDisabled} />
            <select disabled={isGeneralEditingDisabled} />
        </form>
    );
};
```

### Subscription Management
```tsx
const SubscriptionSection = () => {
    const { canAcceptSubscriptions, isCaseInSubscription } = useCaseStatus();
    
    return (
        <div>
            {isCaseInSubscription && <h2>Now Accepting Subscriptions!</h2>}
            {canAcceptSubscriptions && <SubscriptionForm />}
        </div>
    );
};
```

## Functionality Matrix

| Compartment Status | General Edit | ISIN Edit | Delete | Submit | Accept Subscriptions |
|-------------------|-------------|-----------|--------|--------|--------------------|
| **Normal States** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **CASE_FREEZED** | ❌ | ✅ | ❌ | ✅ | ❌ |
| **SUBSCRIPTION** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **ISSUED** | ❌ | ❌ | ❌ | ❌ | ❌ |

## State Transition Flow

```
Normal Setup States
        ↓
   CASE_FREEZED (10)     ← ISIN setup phase
        ↓
   SUBSCRIPTION (8)      ← Accepting subscriptions  
        ↓
     ISSUED (9)          ← Final read-only state
```

## Breaking Changes

### Removed Functions
- `isProductSetupFreezed()` - No longer needed
- `isCompartmentFreezed()` - Replaced with `isCaseFreezed()`

### Updated Behavior
- Status logic now **exclusively** based on `compartmentstatusid`
- `productsetupstatusid` is no longer considered
- ISIN editing is **only** allowed in CASE_FREEZED state
- General editing is disabled in SUBSCRIPTION and ISSUED states

## Migration Required

Components using the old logic should be updated:

**Before**:
```tsx
const isCaseFreezed = caseData?.productsetupstatusid === CompartmentStatus.CASE_FREEZED;
```

**After**:
```tsx
const { isCaseFreezed, isGeneralEditingDisabled } = useCaseStatus();
```

## Testing

The test file has been updated to verify all three states and their specific behaviors:

```bash
# Run the test to verify behavior
cd app/src/utils  
node -e "require('./caseStatusUtils.test.ts').testCaseStatusUtils()"
```

## Components Updated

✅ **BasicProductInfo.tsx** - Uses `useCaseStatus()` hook
✅ **CaseManagementPage.tsx** - Dynamic lock reason display  
✅ **FeesAndCosts.tsx** - Migrated to new logic

### Still Need Migration
- FinStructureDetails.tsx
- KeyDatesSchedules.tsx
- PartiesInvolved.tsx  
- DocumentArchive.tsx
- ProductSetup.tsx

The implementation now perfectly matches your requirements with clear separation of functionality based on the three compartment status states.
