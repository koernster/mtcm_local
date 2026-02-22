# Dynamic Form System

Configuration-driven form rendering based on product profiles stored in the database.

## Quick Start

```tsx
import { DynamicFormRenderer } from './dynamicForm';
import { useProductProfile } from '../hooks/useProductProfile';

const MyComponent = () => {
    const { getTabConfig, loading } = useProductProfile(productTypeId);
    const tabConfig = getTabConfig('basic-product-info');

    return <DynamicFormRenderer tabConfig={tabConfig} loading={loading} />;
};
```

---

## Configuration Schema

### Tab Configuration

```json
{
    "tabs": [
        {
            "id": "basic-product-info",
            "name": "Basic Product Info",
            "sections": [...]
        }
    ]
}
```

### Section Types

**Fields Section** - Grid of form fields:
```json
{
    "id": "dates",
    "type": "fields",
    "grid": 2,
    "fields": [...]
}
```

**Custom Section** - Complex components:
```json
{
    "id": "isins",
    "type": "custom",
    "customComponent": "ISINsSection"
}
```

**Conditional Section**:
```json
{
    "id": "basket-assets",
    "type": "custom",
    "showWhen": { "field": "investmenttype.typename", "equals": "Basket" },
    "customComponent": "BasketAssetsSection"
}
```

---

## Field Types

| Component | Description | Props |
|-----------|-------------|-------|
| `TextInput` | Text field | `placeholder` |
| `DateInput` | Date picker | - |
| `SelectInput` | Dropdown | `options` |
| `PercentageInput` | 0-100% | `min`, `max` |
| `CurrencyInput` | Money field | `currency`, `min`, `showSymbol` |
| `AutocompleteInput` | Search field | `autocomplete` |

### SelectInput Example

```json
{
    "key": "coponfreqid",
    "alias": "Coupon Frequency",
    "reactComponent": "SelectInput",
    "options": {
        "source": "couponFrequencies",
        "labelKey": "frequency",
        "valueKey": "id",
        "excludeValues": ["unwanted-id"]
    }
}
```

### AutocompleteInput Example

```json
{
    "key": "custodianid",
    "alias": "Custodian",
    "reactComponent": "AutocompleteInput",
    "autocomplete": {
        "searchService": "CustodianService",
        "searchMethod": "searchCustodians",
        "labelKey": "custodianname",
        "valueKey": "id",
        "minLength": 2,
        "placeholder": "Search custodians..."
    }
}
```

---

## Registries

### FieldRegistry
Maps component names → React components.

**Adding a new field type:**
```tsx
// In FieldRegistry.tsx
const MyCustomField: React.FC<FieldProps> = ({ config, value, onChange }) => { ... };

export const FieldRegistry = {
    ...existing,
    MyCustomField,
};
```

### CustomSectionRegistry
Maps custom section names → React components for complex UI.

### ServiceRegistry
Maps service names → search functions for autocomplete.

**Registered Services:**
- `CompanyService` → `searchCompanies`
- `CustodianService` → `searchCustodians`

---

## Database

Profile configs are stored in `productprofiles` table:

```sql
CREATE TABLE productprofiles (
    id UUID PRIMARY KEY,
    producttypeid UUID REFERENCES producttypes(id),
    profileconfig JSONB NOT NULL
);
```
