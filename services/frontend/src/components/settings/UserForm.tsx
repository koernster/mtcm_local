import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import { StyledButton, StyledFormControl } from '../styled/CommonStyled';
import { useTheme } from '../../context/ThemeContext';
import ReactSelectStyled from '../styled/ReactSelectStyled';
import useFetchUserGroups from '../../hooks/keycloak/useFetchGroups';
import SkeletonLoading from '../common/SkeletonLoader';
import validateUserInput from '../../lib/validateUser';
import useCreateUser from '../../hooks/keycloak/useCreateUser';
import { useNavigate } from 'react-router-dom';
import { GroupOption, transformGroupOptions } from '../common/Functions';
import toast from 'react-hot-toast';

interface UserFormProps {
  userId?: string;
  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
    groups: GroupOption[];
  };
}

const UserForm: React.FC<UserFormProps> = ({ userId, initialData }) => {
  const { theme } = useTheme();
  const { groups, loading } = useFetchUserGroups(undefined);
  const [createUser, createUserLoading] = useCreateUser();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState<string>(initialData?.firstName || '');
  const [lastName, setLastName] = useState<string>(initialData?.lastName || '');
  const [email, setEmail] = useState<string>(initialData?.email || '');
  const [selectedGroups, setSelectedGroups] = useState<GroupOption[]>(initialData?.groups || []);

  const groupOptions = transformGroupOptions(groups);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setEmail(initialData.email);
      setSelectedGroups(initialData.groups);
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const valid = validateUserInput(email, firstName, lastName, selectedGroups.map(x => x.value));

    if (valid.isValid) {
      //save user.
      const userCreated = await createUser({
        email: email,
        username: email,
        firstName: firstName,
        lastName: lastName,
        groupIds: selectedGroups.map(x => x.value),
      });

      if (userCreated && userCreated.success) {
        toast.success('User Created Successfully!');

        //redirect user to list user component.
        setTimeout(()=>{
          navigate('/settings/manage-user');
        },100);
      } else {
        toast.error(userCreated.error ?? '');
      }
    } else {
      toast.error(valid.error ?? '');
    }

    return false;
  };

  const handleResetPassword = () => {
    // Add your reset password logic here
    alert('Reset password logic goes here');
  };

  const handleDisableUser = () => {
    // Add your disable user logic here
    alert('Disable user logic goes here');
  };

  return (
    <div>
      <Row>
        <div className="d-flex justify-content-between align-items-center my-3">
          <h4 style={{ color: theme.text }}>{userId ? 'Edit User' : 'Create User'}</h4>
        </div>
      </Row>
      <Row>
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formFirstName">
                  <Form.Label style={{ color: theme.text }}>First Name</Form.Label>
                  <StyledFormControl
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formLastName">
                  <Form.Label style={{ color: theme.text }}>Last Name</Form.Label>
                  <StyledFormControl
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="formEmail">
              <Form.Label style={{ color: theme.text }}>Email</Form.Label>
              <StyledFormControl
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!userId}
              />
            </Form.Group>
            <Form.Group controlId="formGroups">
              <Form.Label style={{ color: theme.text }}>Groups</Form.Label>
              {loading ? (<SkeletonLoading count={1} height={[40]} width={['100%']} rows={1} />) :
                (<ReactSelectStyled
                  isMulti={true}
                  value={selectedGroups}
                  onChange={(selected) => setSelectedGroups(selected as GroupOption[])}
                  options={groupOptions} placeholder={''} isSearchable={false}                />)
              }
            </Form.Group>
            <div className="d-flex justify-content-between align-items-center my-3">
              <div>
                <StyledButton variant="primary" type="submit" disabled={createUserLoading}>
                  {userId ? 'Update User' : 'Create User'}
                </StyledButton>
                {createUserLoading && (<Spinner animation="border" role="status">
                  <span className="visually-hidden">Creating User...</span>
                </Spinner>)}
                {userId && (
                  <>
                    &nbsp;<StyledButton variant="secondary" onClick={handleResetPassword} className="ml-2">
                      Reset Password
                    </StyledButton>
                    &nbsp;<StyledButton variant="warning" onClick={handleDisableUser} className="ml-2">
                      Disable User
                    </StyledButton>
                  </>
                )}
              </div>
            </div>
          </Form>
        </Col>
      </Row>
    </div >
  );
};

export default UserForm;
