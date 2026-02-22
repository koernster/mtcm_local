import React, { useEffect, useState } from 'react';
import { Navbar, Image, Dropdown, DropdownItem, DropdownItemText, DropdownMenu, Col, Row } from 'react-bootstrap';
import logo from '../assets/mtcm_logo_ok.webp';
import { useAuth } from '../context/AuthContext';
import { LinkContainer } from 'react-router-bootstrap';
import { StyledNav, StyledNavbar, StyledNavLink, UserInitials } from './styled/NavBarStyled';
import { FaTriangleExclamation } from 'react-icons/fa6';
import useInternetConnectivity from '../hooks/useInternetConnectivity';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const NavBar: React.FC = () => {
  const { logout, keycloak } = useAuth();
  const { theme } = useTheme();
  const [initials, setInitials] = useState("");
  const [username] = useState(keycloak ? keycloak?.idTokenParsed?.name : "Test");
  const isOnline = useInternetConnectivity();

  useEffect(() => {
    const initials = username.split(' ').map((name: any[]) => name[0]).join('').substring(0, 2).toUpperCase();
    setInitials(initials);
  }, [username]);

  const handleLogout = () => {
    //confirm if user wants.
    logout();
  }

    
  useEffect(() => {
    let toastId: string | undefined;

    if (!isOnline) {
      toastId = toast.error('No Internet Connection', {
        duration: Infinity,
        icon: <FaTriangleExclamation color={theme.warning} />,
        position: 'top-center',
      });
    } else if (toastId) {
      toast.dismiss(toastId);
      toastId = undefined;
    }

    return () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, [isOnline]);

  return (
    <StyledNavbar expand="lg">
      <Navbar.Brand>
        <LinkContainer to="/home">
          <Image src={logo} width={150} height={50} alt="MTCM - Mastering Securitizatio'" className="d-inline-block align-top" />
        </LinkContainer>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <StyledNav className="ms-auto align-items-center">
          <StyledNavLink>
            <Dropdown align="end">
              <UserInitials variant="secondary" id="dropdown-basic">
                {initials}
              </UserInitials>
              <DropdownMenu >
                <DropdownItemText className="d-none d-lg-block">Hi, {username}</DropdownItemText>
                <DropdownItem href="/settings">Profile</DropdownItem>
                <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </StyledNavLink>
        </StyledNav>
      </Navbar.Collapse>
    </StyledNavbar>
  );
};

export default NavBar;
