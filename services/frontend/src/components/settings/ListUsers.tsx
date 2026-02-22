import React from 'react';
import { Badge, Col, Row } from 'react-bootstrap';
import { StyledButton, StyledTable } from '../styled/CommonStyled';
import { useTheme } from '../../context/ThemeContext';
import useFetchUsers from '../../hooks/keycloak/useFetchUsers';
import SkeletonLoading from '../common/SkeletonLoader';
import Error from '../common/Error';
import { LinkContainer } from 'react-router-bootstrap';
import { FaCheck, FaKey, FaPlus } from 'react-icons/fa';
import { FaPencil, FaUserLock, FaXmark } from 'react-icons/fa6';

const ListUsers: React.FC = () => {
  const { theme } = useTheme();
  const { users, loading, error } = useFetchUsers();

  if (loading) {
    return <Row>
      <Col md={10}>
        <div className="d-flex justify-content-between align-items-center my-3">
          <SkeletonLoading rows={2} height={[40, 200]} />
        </div>
      </Col>
    </Row>;
  }

  if (error) {
    return <Row>
      <Col md={10}>
        <div className="d-flex justify-content-between align-items-center my-3">
          <Error message={error} />
        </div>
      </Col>
    </Row>;
  }

  return (
    <Row>
      <Col md={10}>
        <div>
          <div className="d-flex justify-content-between align-items-center my-3">
            <h4 style={{ color: theme.text }}>User Management</h4>
            <LinkContainer key={'createUser'} to="/settings/create-user">
              <StyledButton variant="primary">
                <FaPlus /> Add User
              </StyledButton>
            </LinkContainer>
          </div>
          <StyledTable striped hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Email Verified</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td></td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td><Badge bg={user.emailVerified ? 'primary' : 'danger'} pill={true} >
                  {user.emailVerified ? 'Verified ' : 'Not Verified ' }
                    {user.emailVerified ? <FaCheck /> : <FaXmark /> }
                  </Badge></td>
                  <td>
                    <StyledButton variant='primary' title='Edit User'>
                      <FaPencil />
                    </StyledButton>
                    &nbsp;
                    <StyledButton variant='warning' title="Change User Password">
                      <FaKey />
                    </StyledButton>
                    &nbsp;
                    <StyledButton variant='secondary' title="Suspend User">
                      <FaUserLock />
                    </StyledButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </div>
      </Col>
    </Row>
  );
};

export default ListUsers;
