import React from 'react';
import { Col, Container, Nav, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';
import { VerricleStyledNavLink } from '../styled/NavBarStyled';
import { FaHandshakeSimple, FaRegWindowMaximize } from 'react-icons/fa6';
import { MdOutlinePlaylistAddCheck } from "react-icons/md";

interface CaseManagementSideBarProps {
    caseId?: string;
}

const CaseManagementSideBar: React.FC<CaseManagementSideBarProps> = ({ caseId }) => {
    const location = useLocation();
    
    const getItemsRoleBased = () => {
        const sideBarItems = [];

        sideBarItems.push((
            <Nav.Item className="align-items-center" key="product-setup">
                <LinkContainer to={`/case-management/${caseId}/product-setup`}>
                    <VerricleStyledNavLink active={location.pathname.endsWith('/product-setup') || location.pathname === `/case-management/${caseId}`}>
                        <FaRegWindowMaximize size={20} /> &nbsp; Product Setup
                    </VerricleStyledNavLink>
                </LinkContainer>
            </Nav.Item>
        ));

        sideBarItems.push((
            <Nav.Item className="align-items-center" key="subscriptions">
                <LinkContainer to={`/case-management/${caseId}/subscriptions`}>
                    <VerricleStyledNavLink active={location.pathname.endsWith('/subscriptions')}>
                        <FaHandshakeSimple size={20} /> &nbsp; Subscriptions
                    </VerricleStyledNavLink>
                </LinkContainer>
            </Nav.Item>
        ));

        sideBarItems.push((
            <Nav.Item className="align-items-center" key="compartment-overview">
                <LinkContainer to={`/case-management/${caseId}/compartment-overview`}>
                    <VerricleStyledNavLink active={location.pathname.endsWith('/compartment-overview')}>
                        <MdOutlinePlaylistAddCheck size={30} /> &nbsp; Issued
                    </VerricleStyledNavLink>
                </LinkContainer>
            </Nav.Item>
        ));

        return sideBarItems;
    }

    return (
        <Container>
            <Row>
                <Col sm={12} md={12}>
                    <Nav variant="pills" className="flex-column mt-3">
                        {getItemsRoleBased().map(x => x)}
                    </Nav>
                </Col>
            </Row>
        </Container>
    );
};

export default CaseManagementSideBar;
