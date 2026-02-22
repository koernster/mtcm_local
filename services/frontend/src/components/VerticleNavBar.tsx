import React from 'react';
import { Container, Nav } from 'react-bootstrap';
import { FaBriefcase, FaChartColumn, FaGear, FaHouse, FaRegCircleQuestion, FaTicket, FaCalculator } from 'react-icons/fa6';
import { LinkContainer } from 'react-router-bootstrap';
import NotificationBell from './common/NotificationBell';
import { BottomNav, VerricleStyledNavLink } from './styled/NavBarStyled';
import useNotifications from '../hooks/useNotifications';

const VerticleNavBar: React.FC = () => {
    const { notificationsCount } = useNotifications();

    return (
        <Container fluid style={{ height: '100vh' }}>
            <Nav variant="pills" className="flex-column mt-3" style={{ height: '100vh' }}>
                <Nav.Item className=" align-items-center" title='Home'>
                    <LinkContainer to="/home">
                        <VerricleStyledNavLink>
                            <FaHouse size={25} />
                        </VerricleStyledNavLink>
                    </LinkContainer>
                </Nav.Item>
                <Nav.Item className=" align-items-center" title='Notifications'>
                    <LinkContainer to="/notifications">
                        <VerricleStyledNavLink>
                            <NotificationBell count={notificationsCount} />
                        </VerricleStyledNavLink>
                    </LinkContainer>
                </Nav.Item>
                <Nav.Item className=" align-items-center" title='Compartment'>
                    <LinkContainer to="/case-management">
                        <VerricleStyledNavLink>
                            <FaBriefcase size={25} />
                        </VerricleStyledNavLink>
                    </LinkContainer>
                </Nav.Item>
                <Nav.Item className=" align-items-center" title='Nav Page'>
                    <LinkContainer to="/nav-page">
                        <VerricleStyledNavLink>
                            <FaChartColumn size={25} />
                        </VerricleStyledNavLink>
                    </LinkContainer>
                </Nav.Item>
                <Nav.Item className=" align-items-center" title='Interest Coupon'>
                    <LinkContainer to="/interest-coupon">
                        <VerricleStyledNavLink>
                            <FaTicket size={25} />
                        </VerricleStyledNavLink>
                    </LinkContainer>
                </Nav.Item>
                <Nav.Item className=" align-items-center" title='Buy Sell'>
                    <LinkContainer to="/buy-sell">
                        <VerricleStyledNavLink>
                            <FaCalculator size={25} />
                        </VerricleStyledNavLink>
                    </LinkContainer>
                </Nav.Item>
                <BottomNav>
                    <Nav.Item className=" align-items-center" title='Help'>
                        <LinkContainer to="/help">
                            <VerricleStyledNavLink>
                                <FaRegCircleQuestion size={25} />
                            </VerricleStyledNavLink>
                        </LinkContainer>
                    </Nav.Item>
                    <Nav.Item className=" align-items-center mt-auto" title='Settings'>
                        <LinkContainer to="/settings">
                            <VerricleStyledNavLink>
                                <FaGear size={25} />
                            </VerricleStyledNavLink>
                        </LinkContainer>
                    </Nav.Item>
                </BottomNav>
            </Nav>
        </Container>
    );
};

export default VerticleNavBar;


