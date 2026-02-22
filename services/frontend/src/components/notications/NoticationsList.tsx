import React, { useEffect } from 'react';
import SkeletonLoading from '../common/SkeletonLoader';
import { timeAgo } from '../../utils/timeAgo';
import { Col,  Dropdown,  InputGroup,  Row } from 'react-bootstrap';
import { BorderDiv, StyledButton, StyledDropdownItem, StyledDropdownMenu, StyledFormControl, StyledListGroup, StyledListGroupItem } from '../styled/CommonStyled';
import useNotifications from '../../hooks/useNotifications';
import { FaBell, FaTimes, FaRobot, FaCalendar, FaEnvelope, FaArchive, FaSlidersH, FaEnvelopeOpenText, FaUser } from 'react-icons/fa';
import { Small } from '../styled/TypographyStyled';
import InputWrapper from '../common/InputWrapper';
import { FaMagnifyingGlass, FaPenToSquare, FaPlus } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { NotificationStatus } from '../../types/NotificationStatus';

const NoticationsList: React.FC = () => {
    const defaultStatus = [NotificationStatus.SENT, NotificationStatus.READ, NotificationStatus.UNREAD];
    
    const { notificationsList, loadingList, refetchNotificationsList, searchQuery, setSearchQuery, debouncedSearch } = useNotifications();
    const navigate = useNavigate();
    const [selectedFilters, setSelectedFilters] = React.useState<number[]>(defaultStatus);
    const [showDropdown, setShowDropdown] = React.useState(false);

    function handleClick(id: string): void {
        const linkToNavigate =  `/notifications/${id}`;
        navigate(linkToNavigate);
    }

    function handleFilterToggle(status: number, e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setSelectedFilters(prev =>
            prev.includes(status)
                ? prev.filter(f => f !== status)
                : [...prev, status]
        );
    }

    useEffect(() => {
            refetchNotificationsList(selectedFilters, debouncedSearch || undefined);
    }, [selectedFilters, debouncedSearch]);

    return <div style={{ height: '90vh', maxHeight: '90vh' }}>
        <BorderDiv>
            <Row>
                <Col sm={12} md={12}>
                    <InputGroup>                            
                        <InputWrapper 
                            leftIcon={<FaMagnifyingGlass />}
                            style={{ flex: 1 }}
                        >
                            <StyledFormControl 
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0
                                }}
                                disabled={loadingList}
                            />
                        </InputWrapper>  
                        {/* <StyledButton variant="primary" disabled={loadingList}>
                            <FaPenToSquare size={16} />
                        </StyledButton> */}
                        <Dropdown as={StyledButton} variant="primary" show={showDropdown} onToggle={setShowDropdown} disabled={loadingList}>
                            <Dropdown.Toggle as={StyledButton} variant="primary" disabled={loadingList}>
                                <FaSlidersH size={16} />
                            </Dropdown.Toggle>
                            <StyledDropdownMenu>
                                 <StyledDropdownItem hfTransparent={true} onClick={e => handleFilterToggle(NotificationStatus.SENT, e)} active={selectedFilters.includes(NotificationStatus.SENT)} disabled={loadingList}>
                                    <Small> <FaEnvelope />&nbsp;New</Small>
                                </StyledDropdownItem>
                                <StyledDropdownItem hfTransparent={true} onClick={e => handleFilterToggle(NotificationStatus.UNREAD, e)} active={selectedFilters.includes(NotificationStatus.UNREAD)} disabled={loadingList}>
                                    <Small> <FaEnvelope />&nbsp;Unread</Small>
                                </StyledDropdownItem>
                                <StyledDropdownItem hfTransparent={true} onClick={e => handleFilterToggle(NotificationStatus.READ, e)} active={selectedFilters.includes(NotificationStatus.READ)} disabled={loadingList}>
                                    <Small> <FaEnvelopeOpenText />&nbsp;Read</Small>
                                </StyledDropdownItem>
                                <StyledDropdownItem hfTransparent={true} onClick={e => handleFilterToggle(NotificationStatus.ARCHIVED, e)} active={selectedFilters.includes(NotificationStatus.ARCHIVED)} disabled={loadingList}>
                                    <Small> <FaArchive />&nbsp;Archive</Small>
                                </StyledDropdownItem>
                            </StyledDropdownMenu>
                        </Dropdown>
                    </InputGroup>
                </Col>
            </Row>
        </BorderDiv>
        <Col sm={12} md={12} style={{ height:'80vh', maxHeight:'90vh', overflow: 'auto' }}>
            {loadingList ? (
                 <StyledListGroup>
                    {[1,2,3].map(item => (
                        <StyledListGroupItem key={item} 
                            >
                            <Row className="align-items-center">
                                <Col xs={12}>
                                    <SkeletonLoading
                                        count={1}
                                        height={[30]}
                                        width={["150px"]}
                                    />
                                </Col>
                            </Row>
                            <Row className="align-items-center mt-1">
                                <Col xs={12}>
                                    <SkeletonLoading
                                        count={1}
                                        height={[20]}
                                        width={["100px"]}
                                    />
                                </Col>
                            </Row>
                        </StyledListGroupItem>
                    ))}
                </StyledListGroup>
            ) : notificationsList.length === 0 ? (
                <div className="text-center mt-5">
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                        <FaBell style={{ fontSize: 50, color: '#888' }} />
                        <FaTimes style={{ position: 'absolute', bottom: 2, right: 2, fontSize: 20, color: '#d9534f', background: '#fff', borderRadius: '50%' }} />
                    </div>
                    <p style={{ color: '#888', fontSize: 15, marginTop: 16 }}>
                       {
                        selectedFilters.length === 0 ? 
                            ' Select at least one filter to see notifications.' 
                            : 'You will see new notifications here when they arrive.'
                       }
                    </p>
                </div>
            ) : (
                <StyledListGroup>
                    {notificationsList.filter(item => selectedFilters.includes(item.notificationtargets[0]?.status)).map(item => (
                        <StyledListGroupItem key={item.id} 
                             onClick={() => handleClick(item.id)}
                            >
                            <Row className="align-items-center">
                                <Col xs={8}>
                                    <b>
                                        { (item.notificationtargets[0]?.status === NotificationStatus.SENT || item.notificationtargets[0]?.status === NotificationStatus.UNREAD) && <FaEnvelope /> }
                                        { item.notificationtargets[0]?.status === NotificationStatus.READ && <FaEnvelopeOpenText /> }
                                        { item.notificationtargets[0]?.status === NotificationStatus.ARCHIVED && <FaArchive /> }
                                        &nbsp;{item.title}
                                    </b>
                                </Col>
                                <Col xs={4} style={{ textAlign: 'right', fontSize: 12 }}>
                                    {timeAgo(item.createdat)}
                                </Col>
                            </Row>
                            <Row className="align-items-center mt-1">
                                <Col xs={11}>
                                    <Small>
                                        { item.createdby?.toLocaleLowerCase() === 'system' ? <FaRobot /> : <FaUser /> } {item.createdby}
                                    </Small>
                                </Col>
                            </Row>
                        </StyledListGroupItem>
                    ))}
                </StyledListGroup>
            )}
        </Col>
    </div>;
}

export default NoticationsList;