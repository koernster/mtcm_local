import React, { useState, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import SettingsSidebar from '../components/settings/SettingsSideBar.';
import ListUsers from '../components/settings/ListUsers';
import UserProfile from '../components/settings/UserProfile';
import UserForm from '../components/settings/UserForm';
import ProductProfileManager from '../components/settings/ProductProfileManager';
import SPVManager from '../components/settings/SPVManager';
import ContentArea from '../components/common/ContentArea';
import { VerticalBar } from '../components/styled/CommonStyled';

interface SettingsPageProps {
    pageId?: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ pageId }) => {

    const [heading, setHeading] = useState<string>('');
    const [subHeading, setSubHeading] = useState<string>('');

    useEffect(() => {
        switch (pageId) {
            case 'manage-user':
                setHeading('Manage Users');
                setSubHeading('Manage user accounts and permissions');
                break;
            case 'create-user':
                setHeading('Create User');
                setSubHeading('Fill in the details to create a new user');
                break;
            case 'product-profiles':
                setHeading('Product Profile Manager');
                setSubHeading('Configure form layouts for each product type');
                break;
            case 'spv-management':
                setHeading('SPV Management');
                setSubHeading('Manage Special Purpose Vehicles');
                break;
            default:
                setHeading('User Profile');
                setSubHeading('View and edit your profile information');
                break;
        }
    }, [pageId]);

    const renderComponentByPageId = () => {
        switch (pageId) {
            case 'manage-user':
                return <ListUsers />;
            case 'create-user':
                return <UserForm />;
            case 'product-profiles':
                return <ProductProfileManager />;
            case 'spv-management':
                return <SPVManager />;
            default:
                return <UserProfile />;
        }
    }

    return (
        <Container fluid>
            <Row>
                <VerticalBar sm={3} autoWidth={false}>
                    <SettingsSidebar />
                </VerticalBar>
                <ContentArea
                    sm={9} md={9} xs={9} lg={9}
                    heading={heading}
                    subHeader={subHeading}
                    body={renderComponentByPageId()}
                />
            </Row>
        </Container>
    );
};

export default SettingsPage;