// StyledDropdown: multi-select dropdown styled with theme
import { useState } from 'react';
import styled, { css } from 'styled-components';
import { Table, Form, Button, Card, Col, Modal, Popover, Dropdown, Tabs } from 'react-bootstrap';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { Small } from './TypographyStyled';

// Common themed icon components
export const ErrorIcon = styled(FaExclamationTriangle)`
    color: ${props => props.theme.warning};
`;

export const WarningIcon = styled(FaInfoCircle)`
    color: ${props => props.theme.warning};
`;

export const InfoIcon = styled(FaInfoCircle)`
    color: ${props => props.theme.primary};
`;

// Common themed text components
export const ErrorText = styled.h5`
    color: ${props => props.theme.text};
    margin-bottom: 0.5rem;
`;

export const MessageText = styled.p`
    color: ${props => props.theme.text};
    margin-bottom: 0;
`;

export const HelpText = styled(Small)`
    color: ${props => props.theme.textMuted};
`;

export const TabTitle = styled.span`
    color: ${props => props.theme.text};
`;

export const EmptyStateText = styled.h6`
    color: ${props => props.theme.text};
    margin-bottom: 0.5rem;
`;

// StyledTabs: theme-aware styled wrapper for react-bootstrap Tabs
export const StyledTabs = styled(Tabs)`
  .nav-tabs {
    border-bottom: none !important;
    background: ${({ theme }) => theme.background};
    padding-left: 0.15rem;
    padding-right: 0.15rem;
    border-radius: 0 !important;
    box-shadow: none !important;
    margin-bottom: 0.1rem;
    min-height: 28px;
  }

  .nav-item {
    margin-bottom: 0;
    border-bottom: none !important;
    margin-right: 0.1rem;
  }

  .nav-link {
    box-shadow: none !important;
    color: ${({ theme }) => theme.text};
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    font-weight: 500;
    font-size: 0.92rem;
    padding: 0.35rem 0.7rem;
    min-height: 24px;
    transition: color 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s;
    border-radius: 0 !important;

    &:hover, &:focus {
      color: ${({ theme }) => theme.primary};
      background: ${({ theme }) => theme.hoverLight};
      border-bottom: 2px solid ${({ theme }) => theme.primary};
      outline: none;
      box-shadow: 0 1px 4px 0 ${({ theme }) => theme.primary}22;
    }

    &.active, &.show {
      color: ${({ theme }) => theme.primary};
      background: linear-gradient(90deg, ${({ theme }) => theme.primary}11 0%, ${({ theme }) => theme.primary}22 100%);
      border-bottom: 2px solid ${({ theme }) => theme.primary};
      font-weight: 700;
      box-shadow: 0 2px 8px 0 ${({ theme }) => theme.primary}22;
      position: relative;
    }

    &:disabled {
      color: ${({ theme }) => theme.textMuted};
      background: ${({ theme }) => theme.background};
      border-bottom: 2px solid ${({ theme }) => theme.border};
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  /* Responsive: stack tabs on small screens */
  @media (max-width: 576px) {
    .nav-tabs {
      flex-direction: column;
      border-bottom: none;
      min-height: 0;
    }
    .nav-link {
      border-bottom: none;
      border-left: 3px solid transparent;
      border-radius: 0 !important;
      padding: 0.35rem 0.5rem;
      font-size: 0.88rem;
      min-height: 20px;
      &:hover, &:focus {
        border-left: 3px solid ${({ theme }) => theme.primary};
        background: ${({ theme }) => theme.hoverLight};
      }
      &.active, &.show {
        border-left: 3px solid ${({ theme }) => theme.primary};
        background: linear-gradient(90deg, ${({ theme }) => theme.primary}11 0%, ${({ theme }) => theme.primary}22 100%);
      }
    }
  }
`;

export const StyledTable = styled(Table)`
  border-color: ${({ theme }) => theme.border} !important;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.background};
  font-size: 0.85rem;

  th, td {
    border-color: ${({ theme }) => theme.border} !important;
    padding: 0.4rem 0.5rem !important;
    vertical-align: middle;
  }

  th {
    background-color: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.text};
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.5rem 0.5rem !important;
  }

  tr {
    &:hover {
      background-color: ${({ theme }) => theme.hoverLight} !important;
    }
  }

  /* Compact form controls within table cells */
  input, select, textarea {
    padding: 0.25rem 0.4rem !important;
    font-size: 0.8rem !important;
    height: auto !important;
    min-height: 32px;

    &:disabled {
      background-color: ${({ theme }) => theme.border} !important;
      color: ${({ theme }) => theme.text} !important;
      border: 1px solid ${({ theme }) => theme.border} !important;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  /* Responsive adjustments for very small screens */
  @media (max-width: 576px) {
    font-size: 0.75rem;
    
    th, td {
      padding: 0.25rem 0.3rem !important;
    }
    
    th {
      font-size: 0.7rem;
    }
    
    input, select, textarea {
      padding: 0.2rem 0.3rem !important;
      font-size: 0.7rem !important;
      min-height: 28px;

      &:disabled {
        background-color: ${({ theme }) => theme.border} !important;
        color: ${({ theme }) => theme.text} !important;
        border: 1px solid ${({ theme }) => theme.border} !important;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }
`;

interface StyledButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'warning';
}

const buttonStyles = (variant: 'primary' | 'secondary' | 'success' | 'warning', theme: any) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.primary};
        color: #ffffff;
        border: none;
        &:hover {
          background-color: ${theme.primaryHover};
          transform: translateY(-1px);
        }
        &:active {
          background-color: ${theme.primary};
          transform: translateY(0);
        }
      `;
    case 'secondary':
      return css`
        background-color: ${theme.secondary};
        color: #ffffff;
        border: none;
        &:hover {
          background-color: ${theme.secondaryHover};
          transform: translateY(-1px);
        }
        &:active {
          background-color: ${theme.secondary};
          transform: translateY(0);
        }
      `;
    case 'success':
      return css`
        background-color: ${theme.success};
        color: #ffffff;
        border: none;
        &:hover {
          background-color: ${theme.successHover};
          transform: translateY(-1px);
        }
        &:active {
          background-color: ${theme.success};
          transform: translateY(0);
        }
      `;
    case 'warning':
      return css`
        background-color: ${theme.warning};
        color: #ffffff;
        border: none;
        &:hover {
          background-color: ${theme.warningHover};
          transform: translateY(-1px);
        }
        &:active {
          background-color: ${theme.warning};
          transform: translateY(0);
        }
      `; default:
      return css`
        background-color: ${theme.default};
        color: #ffffff;
        border: none;
        &:hover {
          background-color: ${theme.defaultHover};
          transform: translateY(-1px);
        }
        &:active {
          background-color: ${theme.default};
          transform: translateY(0);
        }
      `;
  }
};

export const StyledButton = styled.button<StyledButtonProps>`
  padding: ${({ theme }) => theme.padding};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.border} !important;
    color: ${({ theme }) => theme.text} !important;
    cursor: not-allowed;
    opacity: 0.6;
    transform: none !important;
    
    &:hover {
      background-color: ${({ theme }) => theme.border} !important;
      transform: none !important;
    }
    
    &:active {
      transform: none !important;
    }
  }

  ${({ variant, theme }) => buttonStyles(variant, theme)}
`;


export const StyledFormControl = styled(Form.Control)`
  background-color: ${({ theme }) => theme.background} !important;
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-bottom: 2px solid ${({ theme }) => theme.border};
  outline: none;
  transition: all 0.2s ease-in-out;
  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }

   &:hover {
    border-color: ${({ theme }) => theme.hover};
    background-color: ${({ theme }) => theme.hoverLight};
  }

  &:focus {
    background-color: ${({ theme }) => theme.hoverLight} !important;
    border-color: ${({ theme }) => theme.hover};
    border-bottom: 2px solid ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
    box-shadow: none;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.border} !important;
    color: ${({ theme }) => theme.text} !important;
    border: 1px solid ${({ theme }) => theme.border} !important;
    border-bottom: 2px solid ${({ theme }) => theme.border} !important;
    cursor: not-allowed;
    opacity: 0.6;
    
    &::placeholder {
      color: ${({ theme }) => theme.textMuted};
      opacity: 0.5;
    }
    
    &:hover {
      background-color: ${({ theme }) => theme.border} !important;
      border-color: ${({ theme }) => theme.border} !important;
    }
    
    &:focus {
      background-color: ${({ theme }) => theme.border} !important;
      border-color: ${({ theme }) => theme.border} !important;
      border-bottom: 2px solid ${({ theme }) => theme.border} !important;
      box-shadow: none !important;
    }
  }
`;

export const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  background-color: ${({ theme }) => theme.background} !important;
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-bottom: 2px solid ${({ theme }) => theme.border};
  border-radius: 0.375rem;
  outline: none;
  transition: all 0.2s ease-in-out;
  resize: vertical;
  min-height: 80px;

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }

  &:hover {
    border-color: ${({ theme }) => theme.hover};
    background-color: ${({ theme }) => theme.hoverLight};
  }

  &:focus {
    background-color: ${({ theme }) => theme.hoverLight} !important;
    border-color: ${({ theme }) => theme.hover};
    border-bottom: 2px solid ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
    box-shadow: none;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.border} !important;
    color: ${({ theme }) => theme.text} !important;
    border: 1px solid ${({ theme }) => theme.border} !important;
    border-bottom: 2px solid ${({ theme }) => theme.border} !important;
    cursor: not-allowed;
    opacity: 0.6;

    &::placeholder {
      color: ${({ theme }) => theme.textMuted};
      opacity: 0.5;
    }

    &:hover {
      background-color: ${({ theme }) => theme.border} !important;
      border-color: ${({ theme }) => theme.border} !important;
    }

    &:focus {
      background-color: ${({ theme }) => theme.border} !important;
      border-color: ${({ theme }) => theme.border} !important;
      border-bottom: 2px solid ${({ theme }) => theme.border} !important;
      box-shadow: none !important;
    }
  }
`;

export const StyledSelect = styled(Form.Select)`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-bottom: 2px solid ${({ theme }) => theme.border};
  outline: none;
  transition: all 0.2s ease-in-out;
  
  /* Custom dropdown arrow/caret styling */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23${({ theme }) => theme.text.replace('#', '')}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  
  &:hover {
    border-color: ${({ theme }) => theme.hover};
    background-color: ${({ theme }) => theme.hoverLight};
  }  &:focus {
    background-color: ${({ theme }) => theme.hoverLight} !important;
    border-color: ${({ theme }) => theme.hover};
    border-bottom: 2px solid ${({ theme }) => theme.defaultHover};
    color: ${({ theme }) => theme.text};
    box-shadow: none;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.border} !important;
    color: ${({ theme }) => theme.text} !important;
    border: 1px solid ${({ theme }) => theme.border} !important;
    border-bottom: 2px solid ${({ theme }) => theme.border} !important;
    cursor: not-allowed;
    opacity: 0.6;
    
    /* Disabled dropdown arrow */
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23${({ theme }) => theme.text.replace('#', '')}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 6 6 6-6'/%3e%3c/svg%3e");
    
    &:hover {
      background-color: ${({ theme }) => theme.border} !important;
      border-color: ${({ theme }) => theme.border} !important;
    }
    
    &:focus {
      background-color: ${({ theme }) => theme.border} !important;
      border-color: ${({ theme }) => theme.border} !important;
      border-bottom: 2px solid ${({ theme }) => theme.border} !important;
      box-shadow: none !important;
    }
  }

  option {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};

    &:hover {
      background-color: ${({ theme }) => theme.hover};
      color: #ffffff;
    }
  }
`;

export const BorderDiv = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  max-height: 10vh;
`;

interface VerticalBarProps { autoWidth: boolean; }
export const VerticalBar = styled(Col).withConfig({
  shouldForwardProp: (prop) => {
    // Don't forward autoWidth to the DOM
    return prop !== 'autoWidth';
  }
}) <VerticalBarProps>`
  background: ${({ theme }) => theme.background};
  color:  ${({ theme }) => theme.text} !important;
  display: flex;
  flex-direction: column;
  padding-left: 0px;
  padding-right: 0px;
  height: 100vh;
  ${(props) => props.autoWidth && `width: fit-content`};
  border-right: solid 1px ${({ theme }) => theme.border};
`;

export const StyledListGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${({ theme }) => theme.background};
  overflow: hidden;

  &::-webkit-scrollbar {
    width: 8px;
    padding: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 4px;    
    padding: 4px;
  }
`;

export const StyledListGroupItem = styled.div`
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  border-left: 0.25rem solid transparent;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.hoverLight};
    border-left: 0.25rem solid ${({ theme }) => theme.hover};
    transform: translateX(2px);
  }

  &.active {
    background-color: ${({ theme }) => theme.hoverLight};
    border-left: 0.25rem solid ${({ theme }) => theme.default};
    transform: translateX(2px);
    border-left: 0.25rem solid ${({ theme }) => theme.default};
    border-left: 0.25rem solid ${({ theme }) => theme.border};
    transform: translateX(2px);
  }
`;

export const VerticalText = styled.div`
  color: ${({ theme }) => theme.text};
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  position: absolute;
  bottom: 5.5rem;
  left: 5%;
  transform: translate(-50%, 1);
  white-space: nowrap;
`;

export const TopButton = styled.div`
  color: ${({ theme }) => theme.text};
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translate(-50%, 0);
`;

export const ScrollContainer = styled.div`
  display: flex;
  overflow-x: hidden;
  padding: 1rem;
  scroll-snap-type: x mandatory;
  width: 90%;
  max-width: 90%;
  margin-left: 5%;
`;

export const ScrollItem = styled.div`
  flex: 0 0 auto;
  margin-right: 1rem;
  scroll-snap-align: start;
`;

export const ControlButton = styled(Button)`
  position: absolute;
  top: 60%;
  transform: translateY(-50%);
  z-index: 2;
  background-color: transparent;
  color: ${({ theme }) => theme.text};
  height: 60%;
  transition: all 0.3s ease-in-out;

  &.left{
    border-left: solid 0.25rem transparent;
  }

  &.right{
    border-right: solid 0.25rem transparent;
  }

  &.left:hover {
    border-left: solid 0.25rem ${({ theme }) => theme.border};
    background-color: ${({ theme }) => theme.hoverLight};
    color: ${({ theme }) => theme.text};
  }
  
  &.right:hover {
    border-right: solid 0.25rem ${({ theme }) => theme.border};
    background-color: ${({ theme }) => theme.hoverLight};
    color: ${({ theme }) => theme.text};
  }

  &:disabled {
    color: ${({ theme }) => theme.text} !important;
    cursor: not-allowed;
    opacity: 0.4;
    
    &.left {
      border-left: solid 0.25rem transparent !important;
    }
    
    &.right {
      border-right: solid 0.25rem transparent !important;
    }
    
    &:hover {
      background-color: transparent !important;
      border-left: solid 0.25rem transparent !important;
      border-right: solid 0.25rem transparent !important;
      color: ${({ theme }) => theme.text} !important;
    }
  }
`;
interface StyledCardProps { animate?: boolean; }
export const StyledCard = styled(Card).withConfig({
  shouldForwardProp: (prop) => {
    // Don't forward animate to the DOM
    return prop !== 'animate';
  }
}) <StyledCardProps>`
  background: ${({ theme }) => theme.background} !important;
  border-left: solid 0.25rem transparent;
  color: ${({ theme }) => theme.text};
  margin: 0.25rem;
  transition: all 0.3s ease-in-out;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  
  ${({ animate = true, theme }) => animate && `
    &:hover {
      background: ${theme.hoverLight} !important;
      border-left: solid 0.25rem ${theme.default};
      transform: translateX(2px);
      color: ${theme.text};
    }
  `}
`;

export const StyledCardHeader = styled(Card.Header)`
  background: ${({ theme }) => theme.default} !important;
  color: ${({ theme }) => theme.text} !important;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding: 0.50rem 1rem;
`;

export const StyledCardBody = styled(Card.Body)`
  background: ${({ theme }) => theme.background} !important;
  color: ${({ theme }) => theme.text};
  padding: 1rem;
`;

export const KanbanContainer = styled(Card)`
  background: ${({ theme }) => theme.background} !important;
  color: ${({ theme }) => theme.text};
  border: solid 1px ${({ theme }) => theme.border};
  border-radius: 0px !important;
  margin:0px;
  padding: 0px;

  .card-header{
    border-radius: 0px !important;
    border-bottom: solid 1px ${({ theme }) => theme.border};
  }
`;

// Styled FormText using theme properties
const StyledFormText = styled.div`
    font-size: 0.875rem;
    color: ${({ theme }) => theme.text}; /* Text color based on theme */
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
    line-height: 1.5;
`;

export default StyledFormText;

// Styled Modal components that align with the theme
export const StyledModal = styled(Modal)`
  .modal-content {
    background-color: ${({ theme }) => theme.background} !important;
    color: ${({ theme }) => theme.text};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    background-color: ${({ theme }) => theme.default} !important;
    color: ${({ theme }) => theme.text} !important;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    padding: 1rem 1.5rem;
    border-radius: 0;

    .modal-title {
      color: ${({ theme }) => theme.text} !important;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .btn-close {
      filter: ${({ theme }) => theme.text === '#ffffff' ? 'invert(1)' : 'none'};
      opacity: 0.8;
      transition: opacity 0.2s ease-in-out;

      &:hover {
        opacity: 1;
      }

      &:focus {
        box-shadow: none;
      }
    }
  }

  .modal-body {
    background-color: ${({ theme }) => theme.background} !important;
    color: ${({ theme }) => theme.text};
    padding: 1.5rem;
    max-height: 70vh;
    overflow-y: auto;

    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.background};
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.border};
      border-radius: 4px;
      transition: background-color 0.2s ease-in-out;

      &:hover {
        background-color: ${({ theme }) => theme.hover};
      }
    }
  }

  .modal-footer {
    background-color: ${({ theme }) => theme.background} !important;
    border-top: 1px solid ${({ theme }) => theme.border};
    padding: 1rem 1.5rem;
    border-radius: 0;

    .btn {
      transition: all 0.2s ease-in-out;

      &.btn-secondary {
        background-color: ${({ theme }) => theme.secondary};
        border-color: ${({ theme }) => theme.secondary};
        color: #ffffff;

        &:hover {
          background-color: ${({ theme }) => theme.secondaryHover};
          border-color: ${({ theme }) => theme.secondaryHover};
          transform: translateY(-1px);
        }

        &:active {
          background-color: ${({ theme }) => theme.secondary};
          border-color: ${({ theme }) => theme.secondary};
          transform: translateY(0);
        }
      }

      &.btn-primary {
        background-color: ${({ theme }) => theme.primary};
        border-color: ${({ theme }) => theme.primary};
        color: #ffffff;

        &:hover {
          background-color: ${({ theme }) => theme.primaryHover};
          border-color: ${({ theme }) => theme.primaryHover};
          transform: translateY(-1px);
        }

        &:active {
          background-color: ${({ theme }) => theme.primary};
          border-color: ${({ theme }) => theme.primary};
          transform: translateY(0);
        }
      }
    }
  }

  /* Backdrop styling */
  &.modal {
    .modal-backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  /* Animation enhancements */
  &.fade .modal-dialog {
    transition: transform 0.3s ease-out;
    transform: translate(0, -50px);
  }

  &.show .modal-dialog {
    transform: none;
  }
`;

export const StyledModalHeader = styled(Modal.Header)`
  background-color: ${({ theme }) => theme.default} !important;
  color: ${({ theme }) => theme.text} !important;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding: 1rem 1.5rem;
  border-radius: 0;

  .modal-title {
    color: ${({ theme }) => theme.text} !important;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .btn-close {
    filter: ${({ theme }) => theme.text === '#ffffff' ? 'invert(1)' : 'none'};
    opacity: 0.8;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }

    &:focus {
      box-shadow: none;
    }
  }
`;

export const StyledModalBody = styled(Modal.Body)`
  background-color: ${({ theme }) => theme.background} !important;
  color: ${({ theme }) => theme.text};
  padding: 1.5rem;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.hover};
    }
  }
`;

export const StyledModalFooter = styled(Modal.Footer)`
  background-color: ${({ theme }) => theme.background} !important;
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 1rem 1.5rem;
  border-radius: 0;

  .btn {
    transition: all 0.2s ease-in-out;

    &.btn-secondary {
      background-color: ${({ theme }) => theme.secondary};
      border-color: ${({ theme }) => theme.secondary};
      color: #ffffff;

      &:hover {
        background-color: ${({ theme }) => theme.secondaryHover};
        border-color: ${({ theme }) => theme.secondaryHover};
        transform: translateY(-1px);
      }

      &:active {
        background-color: ${({ theme }) => theme.secondary};
        border-color: ${({ theme }) => theme.secondary};
        transform: translateY(0);
      }
    }

    &.btn-primary {
      background-color: ${({ theme }) => theme.primary};
      border-color: ${({ theme }) => theme.primary};
      color: #ffffff;

      &:hover {
        background-color: ${({ theme }) => theme.primaryHover};
        border-color: ${({ theme }) => theme.primaryHover};
        transform: translateY(-1px);
      }

      &:active {
        background-color: ${({ theme }) => theme.primary};
        border-color: ${({ theme }) => theme.primary};
        transform: translateY(0);
      }
    }
  }
`;

// Styled component for rows
export const DataRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.text};
`;

// Styled component for labels
export const DataLabel = styled.span`
    font-size: 0.875rem;
    font-weight: bold;
    color: ${({ theme }) => theme.text};
`;

// Styled component for values
export const DataValue = styled.span`
    font-size: 0.875rem;
    color: ${({ theme }) => theme.text};
    transition: color 0.3s ease-in-out;
`;

// Styled Popover components that align with the theme
export const StyledPopover = styled(Popover)`
  .popover {
    background-color: ${({ theme }) => theme.background} !important;
    border: 2px solid ${({ theme }) => theme.border} !important;
    border-radius: ${({ theme }) => theme.borderRadius} !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 
                0 4px 16px rgba(0, 0, 0, 0.1),
                0 2px 8px rgba(0, 0, 0, 0.05) !important;
    z-index: 1070;
  }

  &.bs-popover-top > .popover-arrow::before,
  &.bs-popover-auto[data-popper-placement^="top"] > .popover-arrow::before {
    border-top-color: ${({ theme }) => theme.border} !important;
  }

  &.bs-popover-top > .popover-arrow::after,
  &.bs-popover-auto[data-popper-placement^="top"] > .popover-arrow::after {
    border-top-color: ${({ theme }) => theme.background} !important;
  }

  &.bs-popover-right > .popover-arrow::before,
  &.bs-popover-auto[data-popper-placement^="right"] > .popover-arrow::before {
    border-right-color: ${({ theme }) => theme.border} !important;
  }

  &.bs-popover-right > .popover-arrow::after,
  &.bs-popover-auto[data-popper-placement^="right"] > .popover-arrow::after {
    border-right-color: ${({ theme }) => theme.background} !important;
  }

  &.bs-popover-bottom > .popover-arrow::before,
  &.bs-popover-auto[data-popper-placement^="bottom"] > .popover-arrow::before {
    border-bottom-color: ${({ theme }) => theme.border} !important;
  }

  &.bs-popover-bottom > .popover-arrow::after,
  &.bs-popover-auto[data-popper-placement^="bottom"] > .popover-arrow::after {
    border-bottom-color: ${({ theme }) => theme.background} !important;
  }

  &.bs-popover-left > .popover-arrow::before,
  &.bs-popover-auto[data-popper-placement^="left"] > .popover-arrow::before {
    border-left-color: ${({ theme }) => theme.border} !important;
  }

  &.bs-popover-left > .popover-arrow::after,
  &.bs-popover-auto[data-popper-placement^="left"] > .popover-arrow::after {
    border-left-color: ${({ theme }) => theme.background} !important;
  }
`;

export const StyledPopoverHeader = styled(Popover.Header)`
  background-color: ${({ theme }) => theme.hover} !important;
  color: ${({ theme }) => theme.text} !important;
  border: solid 1px ${({ theme }) => theme.border} !important;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 0 !important;
  margin: 0;
`;

export const StyledPopoverBody = styled(Popover.Body)`
  background-color: ${({ theme }) => theme.background} !important;
  color: ${({ theme }) => theme.text} !important;
  border: solid 1px ${({ theme }) => theme.border} !important;
  border-top: none !important;
  padding: 1rem;
  font-size: 0.85rem;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.hoverLight};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 3px;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: ${({ theme }) => theme.hover};
    }
  }

  /* Styled code blocks within popover */
  code {
    background-color: ${({ theme }) => theme.hover} !important;
    color: ${({ theme }) => theme.text} !important;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.8rem;
    border: 1px solid ${({ theme }) => theme.border};
  }

  /* Styled pre blocks for larger code snippets */
  pre {
    background-color: ${({ theme }) => theme.hover} !important;
    color: ${({ theme }) => theme.text} !important;
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.border};
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.8rem;
    margin: 0.5rem 0;
    overflow-x: auto;
    line-height: 1.4;
  }

  /* Styled lists */
  ul, ol {
    margin: 0.5rem 0;
    padding-left: 1.25rem;

    li {
      margin-bottom: 0.25rem;
      color: ${({ theme }) => theme.text};

      &::marker {
        color: ${({ theme }) => theme.primary};
      }
    }
  }

  /* Styled strong/bold text */
  strong, b {
    color: ${({ theme }) => theme.text};
    font-weight: 600;
  }
`;

// Styled Context Menu components that align with the theme
export const StyledContextMenu = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.hoverLight} !important;
  border: 2px solid ${({ theme }) => theme.border} !important;
  border-radius: 0 !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 
              0 4px 16px rgba(0, 0, 0, 0.1),
              0 2px 8px rgba(0, 0, 0, 0.05) !important;
  z-index: 1000;
  min-width: 150px;
  font-size: 0.875rem;
  overflow: hidden;
`;

export const StyledContextMenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.text} !important;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  font-size: inherit;
  line-height: 1.5;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.hover} !important;
    color: ${({ theme }) => theme.text} !important;
  }

  &:active {
    background-color: ${({ theme }) => theme.border} !important;
    color: ${({ theme }) => theme.text} !important;
  }

  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.hover} !important;
    color: ${({ theme }) => theme.text} !important;
  }

  &:disabled {
    background-color: transparent !important;
    color: ${({ theme }) => theme.textMuted} !important;
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background-color: transparent !important;
      color: ${({ theme }) => theme.textMuted} !important;
    }
  }
`;

export const StyledContextMenuDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.border};
  margin: 0;
`;

export const StyledDropdownToggle = styled(Dropdown.Toggle)`
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
`;

export const StyledDropdownMenu = styled(Dropdown.Menu)`
  background: ${({ theme }) => theme.hoverLight};
  color: ${({ theme }) => theme.text};
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  z-index: 1000;
`;
interface StyledDropdownItemProps {
  hfTransparent?: boolean;
}

export const StyledDropdownItem = styled(Dropdown.Item).withConfig({
  shouldForwardProp: (prop) => prop !== 'hfTransparent'
}) <StyledDropdownItemProps>`
  display: flex;
  align-items: center;
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-size: inherit;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  &:last-child { border-bottom: none; }
  &:hover, &:focus {
    background: ${({ hfTransparent, theme }) => hfTransparent ? 'transparent' : theme.hover};
    color: ${({ theme }) => theme.text};
  }
  &.active {
    background: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.text};
  }
  input[type='checkbox'] {
    margin-right: 8px;
  }
`;