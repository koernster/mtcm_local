import React, { useState } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { StyledButton, StyledFormControl, StyledModal, StyledModalHeader, StyledTextArea } from '../../styled/CommonStyled';
import { Spv } from '../../../services/api/graphQL/spv/types/types';
import ImageUploader from '../../common/ImageUploader';

interface SPVFormModalProps {
    spv: Spv | null;
    onClose: () => void;
    onSave: (data: Partial<Spv>) => Promise<void>;
}

const SPVFormModal: React.FC<SPVFormModalProps> = ({ spv, onClose, onSave }) => {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        companyid: spv?.companyid || '',
        spvtitle: spv?.spvtitle || '',
        spvdescription: spv?.spvdescription || '',
        logo: spv?.logo || '',
        // Address fields
        addressline1: spv?.address?.addressline1 || '',
        addressline2: spv?.address?.addressline2 || '',
        city: spv?.address?.city || '',
        country: spv?.address?.country || '',
        postalcode: spv?.address?.postalcode || '',
        email: spv?.address?.email || '',
        phone: spv?.address?.phone || '',
        website: spv?.address?.website || '',
        // Payment detail fields
        iban: spv?.paymentdetail?.iban || '',
        bankname: spv?.paymentdetail?.bankname || '',
        address: spv?.paymentdetail?.address || '',
        beneficiary: spv?.paymentdetail?.beneficiary || '',
        bicintermediary: spv?.paymentdetail?.bicintermediary || '',
        swift: spv?.paymentdetail?.swift || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.spvtitle.trim()) {
            return;
        }

        setSaving(true);
        try {
            await onSave({
                companyid: formData.companyid || undefined,
                spvtitle: formData.spvtitle,
                spvdescription: formData.spvdescription,
                logo: formData.logo || undefined,
                address: {
                    addressline1: formData.addressline1,
                    addressline2: formData.addressline2,
                    city: formData.city,
                    country: formData.country,
                    postalcode: formData.postalcode,
                    email: formData.email,
                    phone: formData.phone,
                    website: formData.website
                },
                paymentdetail: {
                    iban: formData.iban,
                    bankname: formData.bankname,
                    address: formData.address,
                    beneficiary: formData.beneficiary,
                    bicintermediary: formData.bicintermediary,
                    swift: formData.swift
                }
            });
        } finally {
            setSaving(false);
        }
    };

    const isEditMode = !!spv;

    return (
        <StyledModal show onHide={onClose} size="lg">
            <StyledModalHeader closeButton>
                <Modal.Title>{isEditMode ? 'Edit SPV' : 'Create New SPV'}</Modal.Title>
            </StyledModalHeader>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Title *</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="spvtitle"
                                    value={formData.spvtitle}
                                    onChange={handleChange}
                                    placeholder="Enter title"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Company ID</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="companyid"
                                    value={formData.companyid}
                                    onChange={handleChange}
                                    placeholder="Enter company ID"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <StyledTextArea
                                    rows={3}
                                    name="spvdescription"
                                    value={formData.spvdescription}
                                    onChange={handleChange}
                                    placeholder="Enter description"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Logo</Form.Label>
                                <ImageUploader
                                    value={formData.logo}
                                    onChange={(imageData) => setFormData(prev => ({ ...prev, logo: imageData || '' }))}
                                    maxWidth={500}
                                    maxHeight={500}
                                    maxSizeMB={2}
                                    placeholder="Click or drag logo image to upload"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6 className="mb-3 mt-4">Address Information</h6>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Address Line 1</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="addressline1"
                                    value={formData.addressline1}
                                    onChange={handleChange}
                                    placeholder="Enter address line 1"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Address Line 2</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="addressline2"
                                    value={formData.addressline2}
                                    onChange={handleChange}
                                    placeholder="Enter address line 2"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>City</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Country</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Enter country"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Postal Code</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="postalcode"
                                    value={formData.postalcode}
                                    onChange={handleChange}
                                    placeholder="Enter postal code"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6 className="mb-3 mt-4">Contact Information</h6>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <StyledFormControl
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Website</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="Enter website"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h6 className="mb-3 mt-4">Payment Details</h6>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Bank Name</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="bankname"
                                    value={formData.bankname}
                                    onChange={handleChange}
                                    placeholder="Enter bank name"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Address</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Beneficiary</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="beneficiary"
                                    value={formData.beneficiary}
                                    onChange={handleChange}
                                    placeholder="Enter beneficiary"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>IBAN</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="iban"
                                    value={formData.iban}
                                    onChange={handleChange}
                                    placeholder="Enter IBAN"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>SWIFT</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="swift"
                                    value={formData.swift}
                                    onChange={handleChange}
                                    placeholder="Enter SWIFT code"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>BIC Intermediary</Form.Label>
                                <StyledFormControl
                                    type="text"
                                    name="bicintermediary"
                                    value={formData.bicintermediary}
                                    onChange={handleChange}
                                    placeholder="Enter BIC intermediary"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <StyledButton variant="secondary" onClick={onClose}>
                    Cancel
                </StyledButton>
                <StyledButton
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={saving || !formData.spvtitle.trim()}
                >
                    {saving ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
                </StyledButton>
            </Modal.Footer>
        </StyledModal>
    );
};

export default SPVFormModal;
