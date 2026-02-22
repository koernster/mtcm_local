/**
 * SPV Manager
 * 
 * Admin page for managing Special Purpose Vehicles (SPVs).
 * Allows creating, editing, and viewing SPVs.
 */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaPlus, FaBuilding } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTheme } from '../../../context/ThemeContext';
import { StyledButton, StyledTable } from '../../styled/CommonStyled';
import SpvService from '../../../services/api/graphQL/spv/service';
import { Spv } from '../../../services/api/graphQL/spv/types/types';
import SPVFormModal from './SPVFormModal';
import {
    EmptyState,
    LayoutContainer,
    MainContent,
    TitleCell,
    DescriptionCell,
} from './styled';
import { FaPencilAlt } from 'react-icons/fa';

const SPVManager: React.FC = () => {
    const { theme } = useTheme();
    const [spvs, setSpvs] = useState<Spv[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSpv, setEditingSpv] = useState<Spv | null>(null);

    const spvService = SpvService.getInstance();

    // Load SPVs on mount
    useEffect(() => {
        loadSpvs();
    }, []);

    const loadSpvs = async () => {
        try {
            setLoading(true);
            const data = await spvService.fetchSpvsFromServer();
            setSpvs(data || []);
        } catch (error) {
            console.error('Failed to load SPVs:', error);
            toast.error('Failed to load SPVs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingSpv(null);
        setShowModal(true);
    };

    const handleEdit = (spv: Spv) => {
        setEditingSpv(spv);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingSpv(null);
    };

    const handleSave = async (spvData: Partial<Spv>) => {
        try {
            if (editingSpv) {
                // Update existing SPV
                await spvService.updateSpv(editingSpv.id, spvData);
                toast.success('SPV updated successfully');
            } else {
                // Create new SPV
                await spvService.createSpv(
                    spvData.spvtitle || '',
                    spvData.spvdescription,
                    spvData.logo
                );
                toast.success('SPV created successfully');
            }

            // Refresh the list
            await loadSpvs();
            handleModalClose();
        } catch (error) {
            console.error('Failed to save SPV:', error);
            toast.error(editingSpv ? 'Failed to update SPV' : 'Failed to create SPV');
        }
    };

    if (loading && spvs.length === 0) {
        return (
            <Container>
                <EmptyState>
                    <Spinner animation="border" />
                    <p className="mt-3">Loading SPVs...</p>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Row>
            <Col md={12}>
                <div className="d-flex justify-content-between align-items-center my-3">
                    <h4 style={{ color: theme.text }}>
                        SPV Manager
                    </h4>
                </div>

                {/* Action button */}
                <div className="d-flex align-items-center gap-2 mb-3">
                    <StyledButton
                        variant="primary"
                        onClick={handleCreate}
                        title="Add new SPV"
                    >
                        <FaPlus /> Add SPV
                    </StyledButton>
                </div>

                {spvs.length === 0 ? (
                    <EmptyState>
                        <FaBuilding size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No SPVs found. Click "Add SPV" to create one.</p>
                    </EmptyState>
                ) : (
                    <LayoutContainer>
                        <MainContent>
                            <StyledTable striped hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>City</th>
                                        <th>Country</th>
                                        <th>Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {spvs.map((spv, index) => (
                                        <tr key={spv.id}>
                                            <td>{index + 1}</td>
                                            <TitleCell>{spv.spvtitle}</TitleCell>
                                            <DescriptionCell title={spv.spvdescription || '-'}>
                                                {spv.spvdescription || '-'}
                                            </DescriptionCell>
                                            <td>{spv.address?.city || '-'}</td>
                                            <td>{spv.address?.country || '-'}</td>
                                            <td>
                                                <StyledButton
                                                    variant="primary"
                                                    title="Edit SPV"
                                                    onClick={() => handleEdit(spv)}
                                                >
                                                    <FaPencilAlt />
                                                </StyledButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </StyledTable>
                        </MainContent>
                    </LayoutContainer>
                )}

                {showModal && (
                    <SPVFormModal
                        spv={editingSpv}
                        onClose={handleModalClose}
                        onSave={handleSave}
                    />
                )}
            </Col>
        </Row>
    );
};

export default SPVManager;
