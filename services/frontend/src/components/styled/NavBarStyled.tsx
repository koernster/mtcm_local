import { Dropdown, Nav, Navbar } from 'react-bootstrap';
import styled from 'styled-components';

export const UserInitials = styled(Dropdown.Toggle)`
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border:none;
  
  &::after {
    display: none;
  }
`;

export const StyledNavbar = styled(Navbar)`
  background: ${({ theme }) => theme.navbarBackground} !important;
  border-bottom: solid 1px ${({ theme }) => theme.border};
  padding-left: 15px;
  padding-right: 15px;
`;

export const StyledNav = styled(Nav)`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: flex-end;
`;

export const StyledNavLink = styled(Nav.Link)`
  display: inline-block;
  color: ${({ theme }) => theme.text} !important;
  padding: ${({ theme }) => theme.padding};
  margin: 5px;
  text-align: center;
  transition: all 0.2s ease-in-out;
  border-bottom: 2px solid transparent;

  &:hover {
    border-bottom: 2px solid ${({ theme }) => theme.text};
  }
`;

/*Verticle Nav */
export const BottomNav = styled.div`
  margin-top: auto;
  padding-bottom: 6.5rem;
`;


export const VerricleStyledNavLink = styled(Nav.Link)`
  color: ${({ theme }) => theme.text} !important;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  vertical-align: center;
  border-left: 0.25rem solid transparent;
  padding-top: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 2px;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
    border-left: 0.25rem solid ${({ theme }) => theme.default};
  }

  &.active {
    background-color: ${({ theme }) => theme.default} !important;
    border-left: 0.25rem solid ${({ theme }) => theme.default};
    color: #ffffff !important;

    &:hover {
      background-color: ${({ theme }) => theme.hover} !important;
    }
  }
`;

