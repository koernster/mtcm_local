import styled from 'styled-components';

export const StyledAccordionHeader = styled.div`
  background-color: ${({ theme }) => theme.default};
  border-left: 0.25rem solid ${({ theme }) => theme.border};
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  font-weight: bolder;
  transition: all 0.2s ease-in-out;  &:hover {
    background-color: ${({ theme }) => theme.hover};
    border-left: 0.25rem solid ${({ theme }) => theme.default};
    transform: translateX(1px);
  }
  &.accordion-button {
    border-bottom: none !important;
    &::after {
      display: none;
    }
  }
`;

export const StyledAccordionBody = styled.div`
  background-color: ${({ theme }) => theme.background};
  padding: 1.25rem;
  border-left: 1px solid ${({ theme }) => theme.border};
  border-right: 1px solid ${({ theme }) => theme.border};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: all 0.2s ease-in-out;
  
  &.accordion-collapse.show {
    border-top: 1px solid ${({ theme }) => theme.border};
  }
`;

export const StyledAccordionItem = styled.div`  
  background-color: transparent;
  color: ${({ theme }) => theme.text};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 1rem;
  transition: all 0.2s ease-in-out;
  
  &:hover ${StyledAccordionHeader} {
    background-color: ${({ theme }) => theme.hoverLight};
  }
  
  &.accordion-item {
    border: none;
  }
  
  .accordion-button {
    box-shadow: none !important;
    &::after {
      display: none;
    }
  }
`;
