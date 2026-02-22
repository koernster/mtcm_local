import React, { useEffect, useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';
import { StyledFormControl, StyledSelect } from '../styled/CommonStyled';
import { useAuth } from '../../context/AuthContext';
import ResetPasswordPopover from './ResetPasswordPopover';

const UserProfile: React.FC = () => {
    const { keycloak, userGroups } = useAuth();
    const { theme, setTheme } = useTheme();
    const [selectedOption, setSelectedOption] = useState<string>('');

    useEffect(() => {
        const storedOption = localStorage.getItem('theme');
        if (storedOption) {
            setSelectedOption(storedOption);
        }
    }, []);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value.toString();
        setSelectedOption(newValue);
        setTheme(newValue);
    };

    return (
        <div>
            <Row>
                <Col md={6}>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label style={{ color: theme.text }}>Name</Form.Label>
                            <StyledFormControl value={keycloak?.idTokenParsed?.name} type="text" disabled placeholder="Your name" />
                        </Form.Group>

                        <Form.Group controlId="formEmail">
                            <Form.Label style={{ color: theme.text }}>Email</Form.Label>
                            <StyledFormControl value={keycloak?.idTokenParsed?.email} type="email" disabled placeholder="Your email" />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label style={{ color: theme.text }}>Groups you part of</Form.Label>
                            <StyledFormControl value={userGroups.map(x=>x).join(', ')} type="text" disabled placeholder="Groups you part of" />
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center my-3">
                            <div>
                                <ResetPasswordPopover />
                            </div>
                        </div>

                        <hr />

                        <Form.Group controlId="formTheme">
                            <Form.Label style={{ color: theme.text }}>Change Theme</Form.Label>
                            <StyledSelect value={selectedOption} onChange={handleSelectChange}>
                                <option value="systemDefault">Follow browser Theme</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </StyledSelect>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
        </div>
    );
};

export default UserProfile;
