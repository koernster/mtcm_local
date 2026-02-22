import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaBuilding, FaSave, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { StyledModal, StyledModalHeader, StyledModalBody, StyledModalFooter, StyledFormControl, StyledButton } from '../styled/CommonStyled';
import PillSwitch from './PillSwitch';
import CompanyService from '../../services/api/graphQL/company/service';
import showToast from '../../lib/toastLib';

interface AddressData {
    clienttype?: boolean;
    addressByAddressid?: {
        addressline1?: string;
        addressline2?: string;
        city?: string;
        state_or_province?: string;
        country?: string;
        postalcode?: string;
        phone?: string;
        email?: string;
        website?: string;
    };
}

interface AddressModalProps {
    show: boolean;
    onHide: () => void;
    companyId: string;
    companyName: string;
    initialData: AddressData;
    onUpdate?: (data: AddressData) => void;
    disabled?: boolean;
    isUnderlyingCompany?: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({
    show,
    onHide,
    companyId,
    companyName,
    initialData,
    onUpdate,
    disabled = false,
    isUnderlyingCompany = false
}) => {
    const { theme } = useTheme();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<AddressData>(initialData);

    const modalTitle = isUnderlyingCompany ? 'Underlying Client Profile' : 'Client Profile';

    const handleFieldChange = (field: string, value: any) => {
        if (field === 'clienttype') {
            setFormData(prev => ({ ...prev, clienttype: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                addressByAddressid: {
                    ...prev.addressByAddressid,
                    [field]: value
                }
            }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const companyService = CompanyService.getInstance();
            await companyService.updateCompany(companyId, formData);
            onUpdate?.(formData);

            // Show success toast
            showToast({
                type: 'success',
                title: 'Success',
                message: `${modalTitle} for ${companyName} has been updated successfully.`,
                duration: 3000,
                position: 'top'
            });

            // Close the modal
            onHide();
        } catch (error) {
            console.error(`Failed to update ${modalTitle}:`, error);
            showToast({
                type: 'error',
                title: 'Error',
                message: `Failed to update ${modalTitle}. Please try again.`,
                duration: 3000,
                position: 'top'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(initialData);
        onHide();
    };

    const renderSeparator = () => (
        <hr style={{ margin: '16px 0', borderColor: theme.border, opacity: 0.3 }} />
    );

    return (
        <StyledModal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            backdrop="static"
        >
            <StyledModalHeader closeButton>
                <h5 className="modal-title">
                    <FaBuilding style={{ marginRight: '8px' }} />
                    {modalTitle}
                </h5>
            </StyledModalHeader>

            <StyledModalBody>
                <Row>
                    <Col>
                        {/* Client Type Section */}
                        <Row className="mb-3">
                            <Col md={isUnderlyingCompany ? 12 : 6}>
                                <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                                    Client Name
                                </Form.Label>
                                <StyledFormControl
                                    type="text"
                                    size="sm"
                                    value={companyName}
                                    disabled
                                    readOnly
                                />
                            </Col>
                            {!isUnderlyingCompany ?
                                (
                                    <Col md={6} className="d-flex flex-column">
                                        <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                                            Client Type
                                        </Form.Label>
                                        <PillSwitch
                                            options={[
                                                { value: false, label: 'Legal Entity' },
                                                { value: true, label: 'Individual' }
                                            ]}
                                            value={formData.clienttype ?? false}
                                            onChange={(value) => handleFieldChange('clienttype', value as boolean)}
                                            name="clienttype-modal"
                                            disabled={disabled}
                                            size="sm"
                                        />
                                    </Col>
                                ) : null}
                        </Row>

                        {renderSeparator()}

                        {/* Address and Contact Information Side by Side */}
                        <Row>
                            {/* Address Section */}
                            <Col md={6}>
                                <div className="mb-3">
                                    <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                                        Address Information
                                    </Form.Label>

                                    <Form.Group className="mb-2">
                                        <Form.Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                            Address Line 1
                                        </Form.Label>
                                        <StyledFormControl
                                            type="text"
                                            size="sm"
                                            value={formData.addressByAddressid?.addressline1 || ''}
                                            onChange={(e) => handleFieldChange('addressline1', e.target.value)}
                                            placeholder="Street address"
                                            disabled={disabled}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-2">
                                        <Form.Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                            Address Line 2
                                        </Form.Label>
                                        <StyledFormControl
                                            type="text"
                                            size="sm"
                                            value={formData.addressByAddressid?.addressline2 || ''}
                                            onChange={(e) => handleFieldChange('addressline2', e.target.value)}
                                            placeholder="Apt, suite, etc. (optional)"
                                            disabled={disabled}
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                                    City
                                                </Form.Label>
                                                <StyledFormControl
                                                    type="text"
                                                    size="sm"
                                                    value={formData.addressByAddressid?.city || ''}
                                                    onChange={(e) => handleFieldChange('city', e.target.value)}
                                                    placeholder="City"
                                                    disabled={disabled}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                                    State/Province
                                                </Form.Label>
                                                <StyledFormControl
                                                    type="text"
                                                    size="sm"
                                                    value={formData.addressByAddressid?.state_or_province || ''}
                                                    onChange={(e) => handleFieldChange('state_or_province', e.target.value)}
                                                    placeholder="State/Province"
                                                    disabled={disabled}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                                    Country
                                                </Form.Label>
                                                <StyledFormControl
                                                    type="text"
                                                    size="sm"
                                                    value={formData.addressByAddressid?.country || ''}
                                                    onChange={(e) => handleFieldChange('country', e.target.value)}
                                                    placeholder="Country"
                                                    disabled={disabled}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                                    Postal Code
                                                </Form.Label>
                                                <StyledFormControl
                                                    type="text"
                                                    size="sm"
                                                    value={formData.addressByAddressid?.postalcode || ''}
                                                    onChange={(e) => handleFieldChange('postalcode', e.target.value)}
                                                    placeholder="Postal code"
                                                    disabled={disabled}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>

                            {/* Contact Information Section */}
                            <Col md={6}>
                                <div className="mb-3">
                                    <Form.Label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                                        Contact Information
                                    </Form.Label>

                                    <Form.Group className="mb-2">
                                        <Form.Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                            Phone
                                        </Form.Label>
                                        <StyledFormControl
                                            type="tel"
                                            size="sm"
                                            value={formData.addressByAddressid?.phone || ''}
                                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                            disabled={disabled}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-2">
                                        <Form.Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                            Email
                                        </Form.Label>
                                        <StyledFormControl
                                            type="email"
                                            size="sm"
                                            value={formData.addressByAddressid?.email || ''}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                            placeholder="contact@company.com"
                                            disabled={disabled}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-2">
                                        <Form.Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                                            Website
                                        </Form.Label>
                                        <StyledFormControl
                                            type="url"
                                            size="sm"
                                            value={formData.addressByAddressid?.website || ''}
                                            onChange={(e) => handleFieldChange('website', e.target.value)}
                                            placeholder="https://www.company.com"
                                            disabled={disabled}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </StyledModalBody>

            <StyledModalFooter>
                <StyledButton
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSaving || disabled}
                >
                    <FaTimes style={{ marginRight: '4px' }} />
                    Cancel
                </StyledButton>
                <StyledButton
                    variant="success"
                    onClick={handleSave}
                    disabled={isSaving || disabled}
                >
                    <FaSave style={{ marginRight: '4px' }} />
                    {isSaving ? 'Saving...' : 'Save'}
                </StyledButton>
            </StyledModalFooter>
        </StyledModal>
    );
};

export default AddressModal;
