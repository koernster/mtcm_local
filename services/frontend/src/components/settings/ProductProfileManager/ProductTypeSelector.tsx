/**
 * ProductTypeSelector Component
 * 
 * Dropdown for selecting product types.
 * Uses StyledSelect from CommonStyled for consistent styling.
 */
import React from 'react';
import { StyledSelect } from '../../styled/CommonStyled';

interface ProductTypeOption {
    id: string;
    typename: string;
    hasProfile?: boolean;
}

interface ProductTypeSelectorProps {
    productTypes: ProductTypeOption[];
    selectedId: string | null;
    onChange: (id: string) => void;
}

const ProductTypeSelector: React.FC<ProductTypeSelectorProps> = ({
    productTypes,
    selectedId,
    onChange,
}) => {
    return (
        <StyledSelect
            value={selectedId || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
            style={{ minWidth: '250px' }}
        >
            {productTypes.length === 0 && (
                <option value="">No product types</option>
            )}
            {productTypes.map((type) => (
                <option key={type.id} value={type.id}>
                    {type.typename} {type.hasProfile === false && '(No Profile)'}
                </option>
            ))}
        </StyledSelect>
    );
};

export default ProductTypeSelector;
