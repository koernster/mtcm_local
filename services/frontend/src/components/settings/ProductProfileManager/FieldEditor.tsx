/**
 * FieldEditor Component
 * 
 * Right panel for editing selected tab/section/field.
 * Uses StyledSelect and StyledFormControl from CommonStyled for consistent styling.
 */
import React from 'react';
import { StyledSelect, StyledFormControl } from '../../styled/CommonStyled';
import {
    EditorTitle,
    FormGroup,
    Label,
} from './styled';

interface FieldEditorProps {
    selectedItem: { type: 'tab' | 'section' | 'field'; data: any } | null;
    onUpdate: (updates: any) => void;
}

const FIELD_TYPES = [
    { value: 'TextInput', label: 'Text Input' },
    { value: 'NumberInput', label: 'Number Input' },
    { value: 'DateInput', label: 'Date Picker' },
    { value: 'SelectInput', label: 'Dropdown Select' },
    { value: 'CurrencyInput', label: 'Currency Input' },
    { value: 'PercentageInput', label: 'Percentage Input' },
    { value: 'AutocompleteInput', label: 'Autocomplete' },
];

const SECTION_TYPES = [
    { value: 'fields', label: 'Fields Section' },
    { value: 'custom', label: 'Custom Component' },
];

const CUSTOM_COMPONENTS = [
    { value: 'ISINsSection', label: 'ISINs Section' },
    { value: 'BasketAssetsSection', label: 'Basket Assets' },
    { value: 'FeesSection', label: 'Fees Section' },
    { value: 'CostsSection', label: 'Costs Section' },
    { value: 'SubscriptionCostsSection', label: 'Subscription Costs' },
];

const FieldEditor: React.FC<FieldEditorProps> = ({ selectedItem, onUpdate }) => {
    if (!selectedItem) {
        return (
            <>
                <EditorTitle>Editor</EditorTitle>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Select a tab, section, or field to edit its properties.
                </p>
            </>
        );
    }

    const { type, data } = selectedItem;

    if (type === 'tab') {
        return (
            <>
                <EditorTitle>Edit Tab</EditorTitle>
                <FormGroup>
                    <Label>Tab Name</Label>
                    <StyledFormControl
                        type="text"
                        value={data.name || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ name: e.target.value })}
                        placeholder="Enter tab name"
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Tab ID</Label>
                    <StyledFormControl
                        type="text"
                        value={data.id || ''}
                        disabled
                        style={{ opacity: 0.6 }}
                    />
                </FormGroup>
            </>
        );
    }

    if (type === 'section') {
        return (
            <>
                <EditorTitle>Edit Section</EditorTitle>
                <FormGroup>
                    <Label>Section Type</Label>
                    <StyledSelect
                        value={data.type || 'fields'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ type: e.target.value })}
                    >
                        {SECTION_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </StyledSelect>
                </FormGroup>

                {data.type === 'custom' && (
                    <FormGroup>
                        <Label>Custom Component</Label>
                        <StyledSelect
                            value={data.customComponent || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ customComponent: e.target.value })}
                        >
                            <option value="">Select component...</option>
                            {CUSTOM_COMPONENTS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </StyledSelect>
                    </FormGroup>
                )}

                {data.type === 'fields' && (
                    <FormGroup>
                        <Label>Grid Columns</Label>
                        <StyledSelect
                            value={data.grid || 2}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ grid: parseInt(e.target.value) })}
                        >
                            <option value={1}>1 Column</option>
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                        </StyledSelect>
                    </FormGroup>
                )}
            </>
        );
    }

    if (type === 'field') {
        const isNew = data.isNew;

        return (
            <>
                <EditorTitle>{isNew ? 'Add Field' : 'Edit Field'}</EditorTitle>
                <FormGroup>
                    <Label>Field Key</Label>
                    <StyledFormControl
                        type="text"
                        value={data.key || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ key: e.target.value })}
                        placeholder="e.g., productname"
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Display Label</Label>
                    <StyledFormControl
                        type="text"
                        value={data.alias || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ alias: e.target.value })}
                        placeholder="e.g., Product Name"
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Field Type</Label>
                    <StyledSelect
                        value={data.reactComponent || 'TextInput'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ reactComponent: e.target.value })}
                    >
                        {FIELD_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </StyledSelect>
                </FormGroup>
                <FormGroup>
                    <Label>Help Text</Label>
                    <StyledFormControl
                        type="text"
                        value={data.fieldInfo || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ fieldInfo: e.target.value })}
                        placeholder="Optional help text"
                    />
                </FormGroup>
                <FormGroup>
                    <Label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={data.required || false}
                            onChange={(e) => onUpdate({ required: e.target.checked })}
                        />
                        Required Field
                    </Label>
                </FormGroup>
            </>
        );
    }

    return null;
};

export default FieldEditor;
