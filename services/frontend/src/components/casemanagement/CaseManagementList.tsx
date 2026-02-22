import React, { useRef, ReactNode } from 'react';
import { Col, Row, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { dateUtils } from '../../utils/formatters';
import { useSelector } from 'react-redux';
import { BorderDiv, StyledButton, StyledListGroup, StyledListGroupItem, StyledFormControl } from '../styled/CommonStyled';
import { RootState } from '../../store/store';
import { FaPlus, FaMagnifyingGlass, FaRegCircleXmark, FaRegFileLines, FaCircleXmark, FaFile } from 'react-icons/fa6';
import { useCases } from '../../hooks/useCases';
import { useCreateCase } from '../../hooks/useCreateCase';
import { Case } from '../../services/api/graphQL/cases/types/case';
import SkeletonLoading from '../common/SkeletonLoader';
import InputWrapper from '../common/InputWrapper';
import styled from 'styled-components';
import { generateCaseManagementUrl } from '../../utils/caseManagementUtils';

const MutedText = styled.small`
    color: ${props => props.theme.textMuted};
`;

const MutedParagraph = styled.p`
    color: ${props => props.theme.textMuted};
`;

const CaseManagementList: React.FC = (): ReactNode => {    const navigate = useNavigate();
    const activeCaseId = useSelector((state: RootState) => state.caseSetup.activeCaseId);
    const { 
        cases, 
        loading: loadingCases, 
        loadingMore, 
        error: loadError, 
        hasMore, 
        loadMore,
        searchQuery,
        setSearchQuery
    } = useCases();
    const {
        createCase,
        loading: creatingCase,
        error: createError
    } = useCreateCase();
    const listRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        if (
            !loadingCases &&
            !loadingMore &&
            hasMore &&
            element.scrollHeight - element.scrollTop <= element.clientHeight + 100
        ) {
            loadMore();
        }
    };

    const getDisplayName = (caseItem: Case) => {
        if (caseItem.company?.companyname) {
            return caseItem.company.companyname;
        }
        return <span className="text-warning">Not Available</span>;
    };        
    
    const handleCaseClick = (caseId: string, compartmentStatus: number) => {
        const url = generateCaseManagementUrl(caseId, compartmentStatus);
        navigate(url);
    };

    const renderSkeletonList = (itemCount: number) => {
        return (
            <StyledListGroup>
                {Array(itemCount).fill(null).map((_, index) => (
                    <StyledListGroupItem key={`skeleton-${index}`}>
                        <SkeletonLoading 
                            rows={3} 
                            height={[24, 20, 16]} 
                            width={['60%', '80%', '40%']}
                        />
                    </StyledListGroupItem>
                ))}
            </StyledListGroup>
        );
    };

    const renderNoDataIcon = () => {
        if (searchQuery) {
            return (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <FaFile size={60} className="text-muted" />
                    <div style={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '2px'
                    }}>
                        <FaMagnifyingGlass size={25}  style={{color: '#fff'}} />
                    </div>
                    <div style={{ 
                        position: 'absolute', 
                        bottom: -5, 
                        right: -10,
                        background: '#fff',
                        borderRadius: '50%'
                    }}>
                        <FaCircleXmark size={25} className="text-danger" />
                    </div>
                </div>
            );
        }
        
        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <FaRegFileLines size={60} className="text-muted" />
                <div style={{ 
                    position: 'absolute', 
                    bottom: -5, 
                    right: -10,
                    background: '#fff',
                    borderRadius: '50%'
                }}>
                    <FaCircleXmark size={25} className="text-danger" />
                </div>
            </div>
        );
    };

    return (
        <div style={{ height: '90vh', maxHeight: '90vh' }}>            
        <BorderDiv>
                <Row>
                    <Col sm={12} md={12}>
                        <InputGroup>                            
                            <InputWrapper 
                                leftIcon={<FaMagnifyingGlass />}
                                isLoading={loadingCases}
                                style={{ flex: 1 }}
                            >
                                <StyledFormControl 
                                    type="text"
                                    placeholder="Search Case"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0
                                    }}
                                />
                            </InputWrapper>                            
                            <InputGroup.Text 
                                as={StyledButton}
                                variant="primary"
                                onClick={createCase}
                                disabled={creatingCase}
                                style={{
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    padding: '6px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {creatingCase ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    <>
                                        <FaPlus size={16} />
                                        <span>New</span>
                                    </>
                                )}
                            </InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Row>
            </BorderDiv>
            <Col 
                sm={12} 
                md={12} 
                style={{ height: '75vh', maxHeight: '82.5vh', overflowY: 'auto' }}
                onScroll={handleScroll}
                ref={listRef}
            >                {(loadError || createError) && (
                    <div className="text-center mt-3">
                        <FaRegCircleXmark className="text-danger" size={50} />
                        <p className="text-danger">
                            {createError ? 'Failed to create new case.' : 'Failed to load cases.'}
                            <br />Please try again later.
                        </p>
                    </div>
                )}
                {loadingCases && !loadingMore ? (
                    renderSkeletonList(4)
                ) : cases.length > 0 ? (
                    <>
                        <StyledListGroup>
                            {cases.map(caseItem => (                                
                                <StyledListGroupItem 
                                    key={caseItem.id}
                                    onClick={() => handleCaseClick(caseItem.id, caseItem.compartmentstatusid)}
                                    style={{ cursor: 'pointer' }}
                                    className={activeCaseId === caseItem.id ? 'active' : ''}
                                >
                                    <Row>
                                        <Col sm={12}>
                                            <b>{caseItem.compartmentname}</b>
                                            <p>{getDisplayName(caseItem)}</p>
                                            <MutedText>
                                                Maturity: { caseItem.maturitydate ? dateUtils.format(caseItem.maturitydate, { format: 'short' }) : <span className="text-danger">N/A</span>}
                                            </MutedText>
                                        </Col>
                                    </Row>
                                </StyledListGroupItem>
                            ))}
                        </StyledListGroup>
                        {loadingMore && (
                            <div className="mt-3">
                                {renderSkeletonList(1)}
                            </div>
                        )}
                    </>) : loadError == null && (
                    <div className="text-center mt-5">
                        {renderNoDataIcon()}
                        <MutedParagraph className="mt-3">
                            {searchQuery ? "Looks like there aren't any cases that match your search terms." : "Your case list is empty. Click the '+' button to create your first case."}
                        </MutedParagraph>
                        {searchQuery && (
                            <MutedText className="d-block mt-1">
                                Try adjusting your search criteria or explore different keywords
                            </MutedText>
                        )}
                    </div>
                )}
            </Col>
        </div>
    );
};

export default CaseManagementList;