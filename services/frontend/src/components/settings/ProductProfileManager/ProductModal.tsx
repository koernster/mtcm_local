/**
 * ProductModal Component
 * 
 * Modal for creating new OR editing existing product profiles.
 * Supports renaming and copying configuration from other profiles.
 * Uses StyledSelect and StyledFormControl from CommonStyled for consistent styling.
 */
import React, { useState, useEffect } from 'react';
import { StyledSelect, StyledFormControl } from '../../styled/CommonStyled';
import {
    ModalOverlay,
    ModalContent,
    ModalTitle,
    FormGroup,
    Label,
    ModalActions,
    ActionButton,
} from './styled';

interface ProductTypeOption {
    id: string;
    typename: string;
    hasProfile?: boolean;
}

interface ProductModalProps {
    /** Existing products for copy-from dropdown */
    existingProducts: ProductTypeOption[];
    /** Close modal handler */
    onClose: () => void;
    /** Save handler - receives name and optional copyFromId */
    onSave: (name: string, copyFromId?: string) => void;
    /** Edit mode - if true, we're editing an existing product */
    isEditMode?: boolean;
    /** Current product name (for edit mode) */
    currentName?: string;
    /** Current product ID (to exclude from copy-from list in edit mode) */
    currentId?: string;
}

const ProductModal: React.FC<ProductModalProps> = ({
    existingProducts,
    onClose,
    onSave,
    isEditMode = false,
    currentName = '',
    currentId,
}) => {
    const [name, setName] = useState(currentName);
    const [copyFromId, setCopyFromId] = useState<string>('');

    // Update name when currentName changes (for edit mode)
    useEffect(() => {
        setName(currentName);
    }, [currentName]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name.trim(), copyFromId || undefined);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Filter to only show products that have profiles (can be copied from)
    // Exclude current product in edit mode
    const productsWithProfiles = existingProducts.filter(p =>
        p.hasProfile !== false && p.id !== currentId
    );

    return (
        <ModalOverlay onClick={handleOverlayClick}>
            <ModalContent>
                <ModalTitle>
                    {isEditMode ? 'Edit Product Profile' : 'Create New Product Type'}
                </ModalTitle>

                <FormGroup>
                    <Label>Product Name</Label>
                    <StyledFormControl
                        type="text"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        placeholder="Enter product name, e.g., Real Estate Fund"
                        autoFocus
                    />
                </FormGroup>

                <FormGroup>
                    <Label>
                        {isEditMode ? 'Copy configuration from (replaces current)' : 'Copy configuration from'}
                    </Label>
                    <StyledSelect
                        value={copyFromId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCopyFromId(e.target.value)}
                    >
                        <option value="">
                            {isEditMode ? 'Keep current configuration' : 'None (start fresh)'}
                        </option>
                        {productsWithProfiles.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.typename}
                            </option>
                        ))}
                    </StyledSelect>
                </FormGroup>

                <ModalActions>
                    <ActionButton onClick={onClose}>
                        Cancel
                    </ActionButton>
                    <ActionButton
                        onClick={handleSave}
                        disabled={!name.trim()}
                        $variant="primary"
                    >
                        {isEditMode ? 'Save' : 'Create'}
                    </ActionButton>
                </ModalActions>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ProductModal;
