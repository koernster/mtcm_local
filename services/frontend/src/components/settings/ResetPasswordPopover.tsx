import React, { useState } from 'react';
import { Popover, OverlayTrigger, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { StyledButton, StyledFormControl } from '../styled/CommonStyled';
import useChangePassword from '../../hooks/keycloak/useChangePassword';
import generateRandomPassword from '../../lib/generateRandomPassword';
import validatePassword from '../../lib/validatePassword';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';

const ResetPasswordPopover: React.FC = () => {
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { loading, error, changePassword } = useChangePassword();
    const { theme } = useTheme();

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(event.target.value);
    };

    const toggleShowPassword = (event: any) => {
        event.preventDefault(); // Prevent the form from submitting
        setShowPassword(!showPassword);

        return false;
    };

    const handleSave = (event: any) => {
        event.preventDefault(); // Prevent the form from submitting
        if (!password) {
            toast.error('Password should not be empty');
            return;
        }

        if (password === confirmPassword) {
            if (validatePassword(password)) {
                changePassword(password);
                if (!error) {
                    toast.success('Password Changed Successfully!');
                    setPassword('');
                    setConfirmPassword(''); 
                }
            } else {
                toast.error('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
            }
        } else {
            toast.error('Password and Confirm Password should be same.');
        }

        //in order to stop submitting form.
        return false;
    };

    const handleGeneratePassword = (event: any) => {
        event.preventDefault();

        setShowPassword(true);
        const password = generateRandomPassword(8);
        setPassword(password);
        setConfirmPassword(password);

        return false;
    }

    const popover = (
        <Popover id="popover-basic">
            <Popover.Header style={{ background: theme.hover, border: `solid 1px ${theme.border}`, color: theme.text }} as="h3">Change Password</Popover.Header>
            <Popover.Body style={{ background: theme.background, border: `solid 1px ${theme.border}` }}>
                {
                    loading ?
                        (<Spinner animation="border" role="status" className="mt-2">
                            <span className="visually-hidden">Changing Password...</span>
                        </Spinner>) :
                        (<Form>
                            <Form.Group controlId="formNewPassword">
                                <Form.Label style={{ color: theme.text }}>New Password</Form.Label>
                                <InputGroup>
                                    <StyledFormControl
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={handlePasswordChange}
                                    />
                                    <StyledButton variant="secondary" onClick={toggleShowPassword}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </StyledButton>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group controlId="formConfirmPassword">
                                <Form.Label style={{ color: theme.text }}>Confirm Password</Form.Label>
                                <StyledFormControl
                                    type='password'
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                />
                            </Form.Group>
                            <StyledButton variant="primary" onClick={handleSave} className="mt-2">
                                Save
                            </StyledButton>&nbsp;
                            <StyledButton variant="secondary" onClick={handleGeneratePassword} className='mt-2'>
                                Generate Password
                            </StyledButton>
                        </Form>)
                }
            </Popover.Body >
        </Popover >
    );

    return (
        <OverlayTrigger trigger="click" placement="right" overlay={popover}>
            <StyledButton variant="warning" onClick={(e: any) => { e.preventDefault(); return false; }}>Change Password</StyledButton>
        </OverlayTrigger>
    );
};

export default ResetPasswordPopover;
