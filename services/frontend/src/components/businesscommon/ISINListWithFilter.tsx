import React, { useRef } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { BorderDiv, StyledFormControl, StyledListGroup, StyledListGroupItem } from '../styled/CommonStyled';
import { FaMagnifyingGlass, FaRegCircleXmark, FaRegFileLines, FaCircleXmark, FaFile } from 'react-icons/fa6';
import InputWrapper from '../common/InputWrapper';
import { useCaseIsins } from '../../hooks/useCaseIsins';
import SkeletonLoading from '../common/SkeletonLoader';
import styled from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa';
import { IsinWithCompartment } from '../../services/api/graphQL/caseisins';

const MutedParagraph = styled.p`
    color: ${props => props.theme.textMuted};
`;

const MutedText = styled.small`
    color: ${props => props.theme.textMuted};
`;

interface ISINListWithFilterProps {
    pageName: string;
}

const ISINListWithFilter: React.FC<ISINListWithFilterProps> = ({ pageName }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { isinId } = useParams<{ isinId: string }>();
    
    const { 
        isinsWithCompartments, 
        loading, 
        loadingMore, 
        error, 
        hasMore, 
        loadMore,
        searchQuery,
        setSearchQuery
    } = useCaseIsins(null);

    const handleISINClick = (selectedIsinId: string) => {
        const linkToNavigate =  `/${pageName}/${selectedIsinId}`;
        navigate(linkToNavigate);
    };

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

    const renderSkeletonList = (itemCount: number) => {
        return (
            <StyledListGroup>
                {Array(itemCount).fill(null).map((_, index) => (
                    <StyledListGroupItem key={`skeleton-${index}`}>
                        <SkeletonLoading 
                            rows={2} 
                            height={[24, 20]} 
                            width={['60%', '80%']}
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

    //useEffect to reset scroll position when searchQuery changes
    React.useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = 0;
        }
    }, [searchQuery]);

    //useEffect to group isins by compartment name in a state when pageName is 'interest-coupon'
    const [groupedIsins, setGroupedIsins] = React.useState<Record<string, IsinWithCompartment[]>>({});

    React.useEffect(() => {
        if (pageName === 'interest-coupon') {
            const grouped = isinsWithCompartments.reduce((acc, isin) => {
                (acc[isin.CompartmentName] = acc[isin.CompartmentName] || []).push(isin);
                return acc;
            }, {} as Record<string, IsinWithCompartment[]>);
            setGroupedIsins(grouped);
        }
        else{
            setGroupedIsins({});
        }
    }, [isinsWithCompartments, pageName]);

    return <div style={{ height: '90vh', maxHeight: '90vh' }}>
        <BorderDiv>
            <Col sm={12} md={12}>
                <InputWrapper 
                    leftIcon={<FaMagnifyingGlass />}
                    isLoading={loading}
                    style={{ flex: 1 }}
                >
                    <StyledFormControl 
                        type="text"
                        placeholder={`Search by ISIN or Compartment`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </InputWrapper> 
            </Col>
        </BorderDiv>
        <Col 
            sm={12} 
            md={12} 
            style={{ height: '80vh', maxHeight: '90vh', overflow: 'auto' }}
            onScroll={handleScroll}
            ref={listRef}
        >
            {error && (
                <div className="text-center mt-3">
                    <FaRegCircleXmark className="text-danger" size={50} />
                    <p className="text-danger">
                        Failed to load ISINs.
                        <br />Please try again later.
                    </p>
                </div>
            )}
            {loading && !loadingMore ? (
                renderSkeletonList(4)
            ) : isinsWithCompartments.length > 0 ? (
                <>
                    <StyledListGroup>
                        {pageName === 'buy-sell' ? (
                            isinsWithCompartments.map(item => (
                                <StyledListGroupItem 
                                    key={item.ID}
                                    className={item.ID === isinId ? 'active' : ''}
                                    onClick={() => handleISINClick(item.ID)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Row>
                                        <Col sm={12}>
                                            <b>{item.IsinNumber || <span className="text-warning"><FaExclamationTriangle /> Unnamed ISIN</span>}</b>
                                            <p>{item.CompartmentName}</p>
                                        </Col>
                                    </Row>
                                </StyledListGroupItem>
                            ))
                        ) : (
                            Object.entries(groupedIsins).map(([compartmentName, items]) => (
                                    <StyledListGroupItem 
                                        key={compartmentName}
                                        className={items[0].CaseId === isinId ? 'active' : ''}
                                        onClick={() => handleISINClick(items[0].CaseId)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Row>
                                            <Col sm={12}>
                                                <b>{compartmentName}</b>
                                                <div className="mt-2">
                                                    {items.slice(0, 3).map(item => (
                                                        <span 
                                                            key={item.ID} 
                                                            className="badge bg-secondary me-1 mb-1"
                                                        >
                                                            {item.IsinNumber}
                                                        </span>
                                                    ))}
                                                    {items.length > 3 && (
                                                        <span className="badge bg-primary me-1 mb-1">
                                                            +{items.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </StyledListGroupItem>
                            )))}
                    </StyledListGroup>
                    {loadingMore && (
                        <div className="mt-3">
                            {renderSkeletonList(1)}
                        </div>
                    )}
                </>
            ) : error == null && (
                <div className="text-center mt-5">
                    {renderNoDataIcon()}
                    <MutedParagraph className="mt-3">
                        {searchQuery ? "Looks like there aren't any ISINs that match your search terms." : "Your ISIN list is empty."}
                    </MutedParagraph>
                    {searchQuery && (
                        <MutedText className="d-block mt-1">
                            Try adjusting your search criteria or explore different keywords
                        </MutedText>
                    )}
                </div>
            )}
        </Col>
    </div>;
}

export default ISINListWithFilter;