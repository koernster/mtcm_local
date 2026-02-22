import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Card, Col, Container, Row, Button } from 'react-bootstrap';
import { ControlButton, KanbanContainer, ScrollContainer, ScrollItem, StyledCard, } from '../components/styled/CommonStyled';
import { H1, H3, H4, H5, Paragraph, Small, Text as ThemedText } from '../components/styled/TypographyStyled';
import { useTheme } from '../context/ThemeContext';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CaseService from '../services/api/graphQL/cases/service';
import SkeletonLoading from '../components/common/SkeletonLoader';
import { useCasesByCompartmentStatus } from '../hooks/useCasesByCompartmentStatus';
import { generateCaseManagementUrl, COMPARTMENT_STATUS_IDS } from '../utils/caseManagementUtils';

interface CardContent {
    title: string;
    id: string;
    amount: string;
    currency: string;
    caseId: string; // Add caseId for navigation
    compartmentId: number; // Add compartmentId for URL generation
}

const HomePage: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [cardContent, setCardContent] = useState<CardContent[]>([]);
    const [loading, setLoading] = useState(true);
    const caseService = CaseService.getInstance();

    // Status IDs for compartment status - memoized to prevent re-renders
    const STATUS_IDS = useMemo(() => ({
        SETUP: COMPARTMENT_STATUS_IDS.PRODUCT_SETUP,
        SUBSCRIPTION: COMPARTMENT_STATUS_IDS.SUBSCRIPTION,
        ISSUED: COMPARTMENT_STATUS_IDS.ISSUED
    }), []);

    // Use the custom hook for each status
    const setupCases = useCasesByCompartmentStatus(STATUS_IDS.SETUP);
    const subscriptionCases = useCasesByCompartmentStatus(STATUS_IDS.SUBSCRIPTION);
    const issuedCases = useCasesByCompartmentStatus(STATUS_IDS.ISSUED);

    useEffect(() => {
        const loadLatestCases = async () => {
            try {
                setLoading(true);
                const cases = await caseService.getTop10LatestUsed();

                const formattedCards: CardContent[] = cases.map(case_ => {
                    const isinNumbers = case_.caseisins.map(isin => isin.isinnumber).join(', ') || '';
                    const currency = case_.caseisins?.[0]?.currency?.currencyshortname || '';
                    const totalAmount = case_.caseisins?.reduce((acc, isin) => acc + isin.issueprice, 0) || 0;

                    return {
                        title: case_.compartmentname || '',
                        id: isinNumbers,
                        currency: currency,
                        amount: totalAmount.toFixed(4),
                        caseId: case_.id, // Store the case ID for navigation
                        compartmentId: case_.compartmentstatusid // Store the compartment ID for navigation
                    };
                });

                setCardContent(formattedCards);
            } catch (error) {
                console.error('Error loading latest cases:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLatestCases();
    }, []);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    const handleCardClick = (caseId: string, compartmentId: number) => {
        const url = generateCaseManagementUrl(caseId, compartmentId);
        navigate(url);
    };

    const renderKanbanContent = (
        cases: any[], 
        loading: boolean, 
        loadingMore: boolean, 
        hasMore: boolean, 
        statusLookup: Record<number, string>,
        compartmentId: number,
        loadMore: () => void
    ) => {
        const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
            const element = e.currentTarget;
            if (
                !loading &&
                !loadingMore &&
                hasMore &&
                element.scrollHeight - element.scrollTop <= element.clientHeight + 100
            ) {
                loadMore();
            }
        };

        return (
            <div onScroll={handleScroll}>
                {loading && cases.length === 0 ? (
                    Array(3).fill(null).map((_, index) => (
                        <div key={`skeleton-${index}`} style={{ marginBottom: '0.5rem' }}>
                            <SkeletonLoading width={["100%"]} height={[60]} />
                        </div>
                    ))
                ) : cases.length > 0 ? (
                    <>
                        {cases.map((case_, index) => (
                            <StyledCard 
                                key={case_.id || index}
                                onClick={() => handleCardClick(case_.id, compartmentId)}
                                style={{ 
                                    cursor: 'pointer',
                                    marginBottom: '0.5rem',
                                    transition: 'transform 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Card.Body style={{ padding: '0.75rem' }}>
                                    <Card.Text>
                                        <b style={{ fontSize: '0.9rem' }}>
                                            {case_.compartmentname?.length > 20 
                                                ? case_.compartmentname.slice(0, 20) + '...' 
                                                : case_.compartmentname}
                                        </b><br/>
                                        {statusLookup[case_.productsetupstatusid || 1]}
                                    </Card.Text>
                                </Card.Body>
                            </StyledCard>
                        ))}
                        {loadingMore && (
                            <div style={{ marginBottom: '0.5rem' }}>
                                <SkeletonLoading width={["100%"]} height={[60]} />
                            </div>
                        )}
                    </>
                ) : (
                    <StyledCard>
                        <Card.Body style={{ padding: '0.75rem' }}>
                            <Card.Text style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                                No cases found
                            </Card.Text>
                        </Card.Body>
                    </StyledCard>
                )}
            </div>
        );
    };

    const renderSkeletonCard = (itemCount: number) => {
        return (
            <>
                {Array(itemCount).fill(null).map((_, index) => (
                    <ScrollItem key={`skeleton-${index}`}>
                        <SkeletonLoading width={["100%"]} height={[100]} />
                    </ScrollItem>
                ))}
            </>
        );
    };

    return <Container fluid>
        <Row className="mt-3">
            <Col xs={12} sm={12} md={12}>
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <Col sm={12} md={12} xs={12}>
                        <H5>Last Used</H5>
                    </Col>
                    <ControlButton onClick={scrollLeft} style={{ left: '10px' }} className='left' variant='default' title="Left">
                        <FaAngleLeft size={20} />
                    </ControlButton>
                    <ScrollContainer ref={scrollRef}>
                        {loading ? (
                            renderSkeletonCard(4)
                        ) : cardContent.length > 0 ? (
                            cardContent.map((content, index) => (
                                <ScrollItem key={index}>
                                    <StyledCard 
                                        onClick={() => handleCardClick(content.caseId, content.compartmentId)}
                                        style={{ 
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <Card.Body>
                                            <Card.Title>
                                                <span title={content.title}>
                                                    {content.title.length > 15 ? content.title.slice(0, 15) + '…' : content.title}
                                                </span>
                                            </Card.Title>
                                            <Card.Text>
                                                <ThemedText>{content.id || "Not Available"}</ThemedText>
                                                <br />
                                                <ThemedText weight="bold">{content.currency} {content.amount}</ThemedText>
                                            </Card.Text>
                                        </Card.Body>
                                    </StyledCard>
                                </ScrollItem>
                            ))
                        ) : (
                            <ScrollItem>
                                <StyledCard>
                                    <Card.Body>
                                        <Card.Text>No cases found</Card.Text>
                                    </Card.Body>
                                </StyledCard>
                            </ScrollItem>
                        )}
                    </ScrollContainer>
                    <ControlButton onClick={scrollRight} style={{ right: '10px' }} className='right' variant='default' title="Right">
                        <FaAngleRight size={20} />
                    </ControlButton>
                </div>
            </Col>
        </Row>
        <Row className="mt-3">
            <Col xs={12} sm={12} md={12}>
                <Row>
                    <Col sm={12} md={12} xs={12}>
                        <H5>Kanban Table</H5>
                    </Col>
                </Row>
                <Row>
                    <Col sm={4} md={4} xs={4}>
                        <KanbanContainer>
                            <Card.Header style={{ background: theme.default, color: theme.text }}>
                                Setup ({setupCases.totalCount})
                            </Card.Header>
                            <Card.Body style={{ maxHeight: '42vh', overflowY: 'auto' }}>
                                {renderKanbanContent(
                                    setupCases.cases,
                                    setupCases.loading,
                                    setupCases.loadingMore,
                                    setupCases.hasMore,
                                    setupCases.statusLookup,
                                    STATUS_IDS.SETUP,
                                    setupCases.loadMore
                                )}
                            </Card.Body>
                        </KanbanContainer>
                    </Col>
                    <Col sm={4} md={4} xs={4}>
                        <KanbanContainer>
                            <Card.Header style={{ background: theme.warning, color: theme.text }}>
                                Subscription ({subscriptionCases.totalCount})
                            </Card.Header>
                            <Card.Body style={{ maxHeight: '42vh', overflowY: 'auto' }}>
                                {renderKanbanContent(
                                    subscriptionCases.cases,
                                    subscriptionCases.loading,
                                    subscriptionCases.loadingMore,
                                    subscriptionCases.hasMore,
                                    subscriptionCases.statusLookup,
                                    STATUS_IDS.SUBSCRIPTION,
                                    subscriptionCases.loadMore
                                )}
                            </Card.Body>
                        </KanbanContainer>
                    </Col>
                    <Col sm={4} md={4} xs={4}>
                        <KanbanContainer>
                            <Card.Header style={{ background: theme.navbarBackground, color: theme.text }}>
                                Issued ({issuedCases.totalCount})
                            </Card.Header>
                            <Card.Body style={{ maxHeight: '42vh', overflowY: 'auto' }}>
                                {renderKanbanContent(
                                    issuedCases.cases,
                                    issuedCases.loading,
                                    issuedCases.loadingMore,
                                    issuedCases.hasMore,
                                    issuedCases.statusLookup,
                                    STATUS_IDS.ISSUED,
                                    issuedCases.loadMore
                                )}
                            </Card.Body>
                        </KanbanContainer>
                    </Col>
                </Row>
            </Col>
        </Row>
    </Container>
};

export default HomePage;