/**
 * Styled components for SPV Manager
 * Uses ThemeContext for consistent styling
 */
import styled from 'styled-components';

// Header container with dropdown and buttons
export const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing?.md || '1rem'};
    margin-bottom: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
`;

// Page header section
export const PageHeaderSection = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
    padding-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
    border-bottom: 1px solid ${({ theme }) => theme.border};
`;

export const PageTitle = styled.h4`
    margin: 0 0 ${({ theme }) => theme.spacing?.xs || '0.25rem'} 0;
    color: ${({ theme }) => theme.text};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.semibold || '600'};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`;

export const PageSubtitle = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.textMuted};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.9rem'};
`;

export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`;

export const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
`;

// Action button (Save, Add)
export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    background: ${({ theme, $variant }) =>
        $variant === 'primary' ? theme.primary : theme.hover};
    border: 1px solid ${({ theme, $variant }) =>
        $variant === 'primary' ? theme.primary : theme.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    color: ${({ theme }) => theme.text};
    padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'} ${({ theme }) => theme.spacing?.md || '1rem'};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.85rem'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${({ theme, $variant }) =>
        $variant === 'primary' ? theme.primaryHover : theme.hoverLight};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

// Table container
export const TableContainer = styled.div`
    background: ${({ theme }) => theme.background};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    overflow: hidden;
`;

// Empty state
export const EmptyState = styled.div`
    text-align: center;
    padding: ${({ theme }) => theme.spacing?.xxl || '3rem'};
    color: ${({ theme }) => theme.textMuted};
`;

// Layout container
export const LayoutContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
`;

export const MainContent = styled.div``;

// Icon button for table actions
export const IconButton = styled.button`
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.textMuted};
    padding: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        color: ${({ theme }) => theme.text};
        background: ${({ theme }) => theme.hover};
    }
`;

// Form group for modal
export const FormGroup = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

export const Label = styled.label`
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing?.xs || '0.25rem'};
    color: ${({ theme }) => theme.textMuted};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.85rem'};
`;

export const Input = styled.input`
    width: 100%;
    padding: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
    background: ${({ theme }) => theme.background};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 4px;
    color: ${({ theme }) => theme.text};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.85rem'};

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.primary};
    }
`;

// Section header
export const SectionHeader = styled.h6`
    margin: ${({ theme }) => theme.spacing?.lg || '1.5rem'} 0 ${({ theme }) => theme.spacing?.md || '1rem'} 0;
    color: ${({ theme }) => theme.text};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.semibold || '600'};
`;

// Table cell for title - no word wrap
export const TitleCell = styled.td`
    white-space: nowrap;
    font-weight: 500;
`;

// Table cell for description - truncate with ellipsis
export const DescriptionCell = styled.td`
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
