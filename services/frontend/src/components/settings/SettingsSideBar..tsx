import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { FaUser, FaUsers, FaCog, FaBuilding } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { VerricleStyledNavLink } from '../styled/NavBarStyled';

const SettingsSidebar: React.FC = () => {
    const { userGroups } = useAuth();

    const getItemsRoleBased = () => {
        const sideBarItems = [];
        sideBarItems.push((
            <Nav.Item className=" align-items-center ">
                <LinkContainer key={'settings'} to="/settings">
                    <VerricleStyledNavLink>
                        <FaUser /> &nbsp; My Profile
                    </VerricleStyledNavLink>
                </LinkContainer>
            </Nav.Item>
        ));

        //validate based on user group.
        if (userGroups) {
            if (userGroups.find(x => x == "SuperAdmin")) {
                sideBarItems.push((
                    <Nav.Item className=" align-items-center">
                        <LinkContainer key={'manageUser'} to="/settings/manage-user">
                            <VerricleStyledNavLink>
                                <FaUsers /> &nbsp; User Management
                            </VerricleStyledNavLink>
                        </LinkContainer></Nav.Item>
                ));
                sideBarItems.push((
                    <Nav.Item className=" align-items-center">
                        <LinkContainer key={'productProfiles'} to="/settings/product-profiles">
                            <VerricleStyledNavLink>
                                <FaCog /> &nbsp; Product Profiles
                            </VerricleStyledNavLink>
                        </LinkContainer></Nav.Item>
                ));
                sideBarItems.push((
                    <Nav.Item className=" align-items-center">
                        <LinkContainer key={'spvManagement'} to="/settings/spv-management">
                            <VerricleStyledNavLink>
                                <FaBuilding /> &nbsp; SPV Management
                            </VerricleStyledNavLink>
                        </LinkContainer></Nav.Item>
                ));
            }
        }

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

export default SettingsSidebar;
