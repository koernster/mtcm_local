import React, { useState } from 'react';
import { Form, Row, Col, FormGroup, FormLabel, FormCheck } from 'react-bootstrap';
import { CompartmentStatus } from '../../../types/CompartmentStatus';
import { FaEye, FaTrash } from 'react-icons/fa';
import styled from 'styled-components';
import StyledFormText, { StyledButton } from '../../styled/CommonStyled';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useCaseStatus } from '../../../hooks/useCaseStatus';

// Styled components for block and button
const Block = styled.div`
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.padding};
    background-color: ${({ theme }) => theme.background};
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.text};
`;

const DocumentArchive: React.FC = () => {
    const caseData = useSelector((state: RootState) => state.caseSetup.caseData);
    const { isCaseFreezed } = useCaseStatus();
    
    const [kycFile, setKycFile] = useState<File | null>(null);
    const [termsheetFile, setTermsheetFile] = useState<File | null>(null);
    const [contractsFile, setContractsFile] = useState<File | null>(null);
    const [structureChartFile, setStructureChartFile] = useState<File | null>(null);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

    const [isKycChecked, setIsKycChecked] = useState(false);
    const [isTermsheetChecked, setIsTermsheetChecked] = useState(false);
    const [isContractsChecked, setIsContractsChecked] = useState(false);
    const [isStructureChartChecked, setIsStructureChartChecked] = useState(false);
    const [isInvoiceChecked, setIsInvoiceChecked] = useState(false);

    const handleFileChange = (
        event: React.ChangeEvent<any>,
        setFile: React.Dispatch<React.SetStateAction<File | null>>
    ) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleViewFile = (file: File | null) => {
        if (file) {
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        }
    };

    const handleRemoveFile = (setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
        setFile(null);
    };

    return (
        <Form>
            {/* KYC Block */}
            <Block>
                <Row>
                    <Col md={4}>
                        <FormGroup controlId="kycFile">
                            <FormCheck
                                type="checkbox"
                                label="KYC Documentation"
                                checked={isKycChecked}
                                onChange={() => setIsKycChecked(!isKycChecked)}
                                disabled={isCaseFreezed}
                            />
                            <StyledFormText>Check to upload KYC documentation.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={8}>
                        <FormGroup controlId="uploadKycFile">
                            <FormLabel>Upload KYC File</FormLabel>
                            <Form.Control
                                type="file"
                                onChange={(event) => handleFileChange(event, setKycFile)}
                                accept=".pdf,.doc,.docx,.png,.jpg"
                                disabled={!isKycChecked || isCaseFreezed}
                            />
                            <StyledFormText>Supported formats: PDF, DOC, DOCX, PNG, JPG.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={12}>
                        {kycFile && (
                            <p>
                                Selected File: <strong>{kycFile.name}</strong>
                                <StyledButton
                                    variant="primary"
                                    className="ms-2"
                                    onClick={() => handleViewFile(kycFile)}
                                >
                                    <FaEye /> View
                                </StyledButton>
                                <StyledButton
                                    variant="warning"
                                    className="ms-2"
                                    onClick={() => handleRemoveFile(setKycFile)}
                                >
                                    <FaTrash /> Remove
                                </StyledButton>
                            </p>
                        )}
                    </Col>
                </Row>
            </Block>

            {/* Termsheet Block */}
            <Block>
                <Row>
                    <Col md={4}>
                        <FormGroup controlId="termsheetFile">
                            <FormCheck
                                type="checkbox"
                                label="Termsheet"
                                checked={isTermsheetChecked}
                                onChange={() => setIsTermsheetChecked(!isTermsheetChecked)}
                                disabled={isCaseFreezed}
                            />
                            <StyledFormText>Check to upload termsheet.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={8}>
                        <FormGroup controlId="uploadTermsheetFile">
                            <FormLabel>Upload Termsheet File</FormLabel>
                            <Form.Control
                                type="file"
                                onChange={(event) => handleFileChange(event, setTermsheetFile)}
                                accept=".pdf,.doc,.docx,.png,.jpg"
                                disabled={!isTermsheetChecked || isCaseFreezed}
                            />
                            <StyledFormText>Supported formats: PDF, DOC, DOCX, PNG, JPG.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={12}>
                        {termsheetFile && (
                            <p>
                                Selected File: <strong>{termsheetFile.name}</strong>
                                <StyledButton
                                    variant="primary"
                                    className="ms-2"
                                    onClick={() => handleViewFile(termsheetFile)}
                                >
                                    <FaEye /> View
                                </StyledButton>
                                <StyledButton
                                    variant="warning"
                                    className="ms-2"
                                    onClick={() => handleRemoveFile(setTermsheetFile)}
                                >
                                    <FaTrash /> Remove
                                </StyledButton>
                            </p>
                        )}
                    </Col>
                </Row>
            </Block>

            {/* Contracts Block */}
            <Block>
                <Row>
                    <Col md={4}>
                        <FormGroup controlId="contractsFile">
                            <FormCheck
                                type="checkbox"
                                label="Contracts"
                                checked={isContractsChecked}
                                onChange={() => setIsContractsChecked(!isContractsChecked)}
                                disabled={isCaseFreezed}
                            />
                            <StyledFormText>Check to upload contracts.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={8}>
                        <FormGroup controlId="uploadContractsFile">
                            <FormLabel>Upload Contracts File</FormLabel>
                            <Form.Control
                                type="file"
                                onChange={(event) => handleFileChange(event, setContractsFile)}
                                accept=".pdf,.doc,.docx,.png,.jpg"
                                disabled={!isContractsChecked}
                            />
                            <StyledFormText>Supported formats: PDF, DOC, DOCX, PNG, JPG.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={12}>
                        {contractsFile && (
                            <p>
                                Selected File: <strong>{contractsFile.name}</strong>
                                <StyledButton
                                    variant="primary"
                                    className="ms-2"
                                    onClick={() => handleViewFile(contractsFile)}
                                >
                                    <FaEye /> View
                                </StyledButton>
                                <StyledButton
                                    variant="warning"
                                    className="ms-2"
                                    onClick={() => handleRemoveFile(setContractsFile)}
                                >
                                    <FaTrash /> Remove
                                </StyledButton>
                            </p>
                        )}
                    </Col>
                </Row>
            </Block>

            {/* Structure Chart Block */}
            <Block>
                <Row>
                    <Col md={4}>
                        <FormGroup controlId="structureChartFile">
                            <FormCheck
                                type="checkbox"
                                label="Structure Chart"
                                checked={isStructureChartChecked}
                                onChange={() => setIsStructureChartChecked(!isStructureChartChecked)}
                                disabled={isCaseFreezed}
                            />
                            <StyledFormText>Check to upload structure chart.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={8}>
                        <FormGroup controlId="uploadStructureChartFile">
                            <FormLabel>Upload Structure Chart File</FormLabel>
                            <Form.Control
                                type="file"
                                onChange={(event) => handleFileChange(event, setStructureChartFile)}
                                accept=".pdf,.doc,.docx,.png,.jpg"
                                disabled={!isStructureChartChecked || isCaseFreezed}
                            />
                            <StyledFormText>Supported formats: PDF, DOC, DOCX, PNG, JPG.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={12}>
                        {structureChartFile && (
                            <p>
                                Selected File: <strong>{structureChartFile.name}</strong>
                                <StyledButton
                                    variant="primary"
                                    className="ms-2"
                                    onClick={() => handleViewFile(structureChartFile)}
                                >
                                    <FaEye /> View
                                </StyledButton>
                                <StyledButton
                                    variant="warning"
                                    className="ms-2"
                                    onClick={() => handleRemoveFile(setStructureChartFile)}
                                >
                                    <FaTrash/> Remove
                                </StyledButton>
                            </p>
                        )}
                    </Col>
                </Row>
            </Block>

            {/* Invoices */}
            <Block>
                <Row>
                    <Col md={4}>
                        <FormGroup controlId="invoiceFile">
                            <FormCheck
                                type="checkbox"
                                label="Invoice"
                                checked={isInvoiceChecked}
                                onChange={() => setIsInvoiceChecked(!isInvoiceChecked)}
                                disabled={isCaseFreezed}
                            />
                            <StyledFormText>Check to upload invoice.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={8}>
                        <FormGroup controlId="uploadInvoiceFile">
                            <FormLabel>Upload Invoice File</FormLabel>
                            <Form.Control
                                type="file"
                                onChange={(event) => handleFileChange(event, setInvoiceFile)}
                                accept=".pdf,.doc,.docx,.png,.jpg"
                                disabled={!isInvoiceChecked || isCaseFreezed}
                            />
                            <StyledFormText>Supported formats: PDF, DOC, DOCX, PNG, JPG.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col md={12}>
                        {invoiceFile && (
                            <p>
                                Selected File: <strong>{invoiceFile.name}</strong>
                                <StyledButton
                                    variant="primary"
                                    className="ms-2"
                                    onClick={() => handleViewFile(invoiceFile)}
                                >
                                    <FaEye /> View
                                </StyledButton>
                                <StyledButton
                                    variant="warning"
                                    className="ms-2"
                                    onClick={() => handleRemoveFile(setInvoiceFile)}
                                >
                                    <FaTrash/> Remove
                                </StyledButton>
                            </p>
                        )}
                    </Col>
                </Row>
            </Block>
        </Form>);
}

export default DocumentArchive;