/**
 * Product Profile Manager
 * 
 * Admin page for managing product profile configurations.
 * Allows creating, editing, and reordering form tabs/sections/fields.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaPlus, FaSave, FaEdit, FaCogs } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';
import { StyledButton } from '../../styled/CommonStyled';
import ProductProfileService from '../../../services/api/graphQL/productProfiles/service';
import ProductTypesService from '../../../services/api/graphQL/productTypes/service';
import type { ProductProfile, ProductProfileConfig, TabConfig, SectionConfig } from '../../../types/dynamicForm';
import ProductTypeSelector from './ProductTypeSelector';
import TabAccordion from './TabAccordion';
import FieldEditor from './FieldEditor';
import ProductModal from './ProductModal';
import {
    HeaderContainer,
    HeaderRight,
    ActionButton,
    LayoutContainer,
    MainContent,
    EditorPanel,
    EmptyState,
    PageHeaderSection,
    PageTitle,
    PageSubtitle,
} from './styled';

interface ProductTypeOption {
    id: string;
    typename: string;
    hasProfile: boolean;
}

const ProductProfileManager: React.FC = () => {
    const { theme } = useTheme();
    const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([]);
    const [selectedProductTypeId, setSelectedProductTypeId] = useState<string | null>(null);
    const [profileConfig, setProfileConfig] = useState<ProductProfileConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ type: 'tab' | 'section' | 'field'; data: any } | null>(null);

    const profileService = ProductProfileService.getInstance();
    const productTypesService = ProductTypesService.getInstance();

    // Load product types on mount
    useEffect(() => {
        loadProductTypes();
    }, []);

    // Load profile when product type changes
    useEffect(() => {
        if (selectedProductTypeId) {
            loadProfile(selectedProductTypeId);
        } else {
            setProfileConfig(null);
        }
    }, [selectedProductTypeId]);

    const loadProductTypes = async () => {
        try {
            setLoading(true);

            // Load all product types from ProductTypesService
            const allProductTypes = await productTypesService.loadProductTypes() || [];

            // Load existing profiles
            const profiles = await profileService.getAllProfiles();
            const profileIds = new Set(profiles.map((p: ProductProfile) => p.producttypeid));

            // Merge: all product types with hasProfile flag
            const types: ProductTypeOption[] = allProductTypes.map((pt: { id: string; typename: string }) => ({
                id: pt.id,
                typename: pt.typename,
                hasProfile: profileIds.has(pt.id)
            }));

            // Also add profiles that don't have a matching product type (custom profiles)
            profiles.forEach((p: ProductProfile) => {
                if (!types.find(t => t.id === p.producttypeid)) {
                    types.push({
                        id: p.producttypeid,
                        typename: p.profileconfig?.productName || `Profile ${p.producttypeid.slice(0, 8)}`,
                        hasProfile: true
                    });
                }
            });

            setProductTypes(types);
            if (types.length > 0 && !selectedProductTypeId) {
                setSelectedProductTypeId(types[0].id);
            }
        } catch (error) {
            console.error('Failed to load product types:', error);
            toast.error('Failed to load product types');
        } finally {
            setLoading(false);
        }
    };

    const loadProfile = async (productTypeId: string) => {
        try {
            setLoading(true);
            const config = await profileService.getProfileConfig(productTypeId);
            const productType = productTypes.find(pt => pt.id === productTypeId);

            // If no profile exists, create empty config for editing
            if (!config) {
                setProfileConfig({
                    productName: productType?.typename || 'New Profile',
                    tabs: []
                });
            } else {
                setProfileConfig(config);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            toast.error('Failed to load profile configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedProductTypeId || !profileConfig) return;

        try {
            setSaving(true);
            await profileService.saveProfile({
                id: selectedProductTypeId,
                producttypeid: selectedProductTypeId,
                profileconfig: profileConfig
            });
            profileService.invalidateCache(selectedProductTypeId);

            // Update hasProfile flag
            setProductTypes(prev => prev.map(pt =>
                pt.id === selectedProductTypeId ? { ...pt, hasProfile: true } : pt
            ));

            toast.success('Profile saved successfully');
        } catch (error) {
            console.error('Failed to save profile:', error);
            toast.error('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleProductTypeChange = (productTypeId: string) => {
        setSelectedProductTypeId(productTypeId);
        setSelectedItem(null);
    };

    const handleAddProduct = () => {
        setIsEditMode(false);
        setShowModal(true);
    };

    const handleEditProduct = () => {
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleModalSave = async (name: string, copyFromId?: string) => {
        try {
            if (isEditMode && selectedProductTypeId && profileConfig) {
                // Edit mode: update name and optionally copy config
                let newConfig = { ...profileConfig, productName: name };

                if (copyFromId) {
                    const sourceConfig = await profileService.getProfileConfig(copyFromId);
                    if (sourceConfig) {
                        newConfig = { ...sourceConfig, productName: name };
                    }
                }

                setProfileConfig(newConfig);
                setProductTypes(prev => prev.map(pt =>
                    pt.id === selectedProductTypeId ? { ...pt, typename: name } : pt
                ));
                setShowModal(false);
                toast.success('Profile updated');
            } else {
                // Create mode: create new profile
                const newId = crypto.randomUUID();
                let newConfig: ProductProfileConfig = {
                    productName: name,
                    tabs: []
                };

                if (copyFromId) {
                    const existingConfig = await profileService.getProfileConfig(copyFromId);
                    if (existingConfig) {
                        newConfig = { ...existingConfig, productName: name };
                    }
                }

                await profileService.saveProfile({
                    id: newId,
                    producttypeid: newId,
                    profileconfig: newConfig
                });

                setProductTypes(prev => [...prev, { id: newId, typename: name, hasProfile: true }]);
                setSelectedProductTypeId(newId);
                setShowModal(false);
                toast.success('Product profile created');
            }
        } catch (error) {
            console.error('Failed to save product:', error);
            toast.error('Failed to save product profile');
        }
    };

    const handleTabsReorder = (newTabs: TabConfig[]) => {
        if (!profileConfig) return;
        setProfileConfig({ ...profileConfig, tabs: newTabs });
    };

    const handleTabUpdate = (tabId: string, updates: Partial<TabConfig>) => {
        if (!profileConfig) return;
        setProfileConfig({
            ...profileConfig,
            tabs: profileConfig.tabs.map(tab =>
                tab.id === tabId ? { ...tab, ...updates } : tab
            )
        });
    };

    const handleSectionUpdate = (tabId: string, sectionId: string, updates: Partial<SectionConfig>) => {
        if (!profileConfig) return;
        setProfileConfig({
            ...profileConfig,
            tabs: profileConfig.tabs.map(tab =>
                tab.id === tabId
                    ? {
                        ...tab,
                        sections: tab.sections.map(section =>
                            section.id === sectionId ? { ...section, ...updates } : section
                        )
                    }
                    : tab
            )
        });
    };

    const handleItemSelect = useCallback((type: 'tab' | 'section' | 'field', data: any) => {
        setSelectedItem({ type, data });
    }, []);

    if (loading && !profileConfig) {
        return (
            <Container>
                <EmptyState>
                    <Spinner animation="border" />
                    <p className="mt-3">Loading product profiles...</p>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Row>
            <Col md={12}>
                <div className="d-flex justify-content-between align-items-center my-3">
                    <h4 style={{ color: theme.text }}>
                        Product Profile Manager
                    </h4>
                </div>

                {/* Product Type Selection with Edit and Add icons */}
                <div className="d-flex align-items-center gap-2 mb-3">
                    <ProductTypeSelector
                        productTypes={productTypes}
                        selectedId={selectedProductTypeId}
                        onChange={handleProductTypeChange}
                    />
                    <StyledButton
                        variant="secondary"
                        onClick={handleEditProduct}
                        disabled={!profileConfig}
                        title="Edit product profile"
                    >
                        <FaEdit />
                    </StyledButton>
                    <StyledButton
                        variant="primary"
                        onClick={handleAddProduct}
                        title="Add new product type"
                    >
                        <FaPlus />
                    </StyledButton>
                </div>

                {!profileConfig ? (
                    <EmptyState>
                        <p>Select a product type to configure or create a new one.</p>
                        <ActionButton onClick={handleAddProduct} $variant="primary">
                            <FaPlus /> Create Product Profile
                        </ActionButton>
                    </EmptyState>
                ) : (
                    <>
                        <LayoutContainer>
                            <MainContent>
                                <TabAccordion
                                    tabs={profileConfig.tabs}
                                    onReorder={handleTabsReorder}
                                    onTabUpdate={handleTabUpdate}
                                    onSectionUpdate={handleSectionUpdate}
                                    onItemSelect={handleItemSelect}
                                />
                            </MainContent>
                            <EditorPanel>
                                <FieldEditor
                                    selectedItem={selectedItem}
                                    onUpdate={(updates: Partial<TabConfig>) => {
                                        if (!selectedItem) return;
                                        // Handle updates based on item type
                                        if (selectedItem.type === 'tab' && selectedItem.data.id) {
                                            handleTabUpdate(selectedItem.data.id, updates);
                                        }
                                    }}
                                />
                            </EditorPanel>
                        </LayoutContainer>

                        {/* Save button at bottom right */}
                        <div className="d-flex justify-content-end mt-4">
                            <StyledButton variant="primary" onClick={handleSave} disabled={saving}>
                                {saving ? <Spinner animation="border" size="sm" /> : <FaSave />} Save Changes
                            </StyledButton>
                        </div>
                    </>
                )}

                {showModal && (
                    <ProductModal
                        existingProducts={productTypes}
                        onClose={() => setShowModal(false)}
                        onSave={handleModalSave}
                        isEditMode={isEditMode}
                        currentName={profileConfig?.productName || ''}
                        currentId={selectedProductTypeId || undefined}
                    />
                )}
            </Col>
        </Row>
    );
};

export default ProductProfileManager;
