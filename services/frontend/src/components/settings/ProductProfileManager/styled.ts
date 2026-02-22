/**
 * Styled components for Product Profile Manager
 * Uses ThemeContext for consistent styling
 */
import styled from 'styled-components';

// Header container with dropdown and buttons
export const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

// Page header section
export const PageHeaderSection = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    padding-bottom: ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.border};
`;

export const PageTitle = styled.h4`
    margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    color: ${({ theme }) => theme.text};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.semibold || '600'};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
`;

export const PageSubtitle = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.textMuted};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.9rem'};
`;


export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
`;

export const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
`;

// Product type dropdown
export const ProductTypeDropdown = styled.select`
    background: ${({ theme }) => theme.hover};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    color: ${({ theme }) => theme.text};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography?.fontSize?.base || '0.9rem'};
    min-width: 200px;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.primary};
    }

    option {
        background: ${({ theme }) => theme.background};
        color: ${({ theme }) => theme.text};
    }
`;

// Add button
export const AddButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.primary};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius};
    color: ${({ theme }) => theme.text};
    padding: ${({ theme }) => theme.spacing.sm};
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: ${({ theme }) => theme.primaryHover};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

// Action button (Save, Preview)
export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    background: ${({ theme, $variant }) =>
        $variant === 'primary' ? theme.primary : theme.hover};
    border: 1px solid ${({ theme, $variant }) =>
        $variant === 'primary' ? theme.primary : theme.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    color: ${({ theme }) => theme.text};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
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

// Accordion container
export const AccordionContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
`;

// Accordion item (Tab or Section)
export const AccordionCard = styled.div<{ $expanded?: boolean; $nested?: boolean }>`
    background: ${({ theme, $nested }) => $nested ? theme.background : theme.hover};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    overflow: hidden;

    ${({ $nested, theme }) => $nested && `
        margin-left: ${theme.spacing.lg};
    `}
`;

export const AccordionHeader = styled.div<{ $expanded?: boolean }>`
    display: flex;
    align-items: center;
    padding: ${({ theme }) => theme.spacing.md};
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: ${({ theme }) => theme.hoverLight};
    }
`;

export const DragHandle = styled.div`
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.textMuted};
    margin-right: ${({ theme }) => theme.spacing.sm};
    cursor: grab;

    &:active {
        cursor: grabbing;
    }
`;

export const AccordionTitle = styled.span`
    flex: 1;
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.medium || '500'};
    color: ${({ theme }) => theme.text};
`;

export const Badge = styled.span`
    background: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
    padding: 2px 8px;
    border-radius: 12px;
    font-size: ${({ theme }) => theme.typography?.fontSize?.xs || '0.75rem'};
    margin-left: ${({ theme }) => theme.spacing.sm};
`;

export const AccordionActions = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.xs};
`;

export const IconButton = styled.button`
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.textMuted};
    padding: ${({ theme }) => theme.spacing.xs};
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        color: ${({ theme }) => theme.text};
        background: ${({ theme }) => theme.hover};
    }
`;

export const ChevronIcon = styled.span<{ $expanded?: boolean }>`
    color: ${({ theme }) => theme.textMuted};
    transition: transform 0.2s;
    transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
    margin-left: ${({ theme }) => theme.spacing.sm};
`;

export const AccordionBody = styled.div`
    padding: ${({ theme }) => theme.spacing.md};
    border-top: 1px solid ${({ theme }) => theme.border};
`;

// Field item in section
export const FieldItem = styled.div`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    cursor: pointer;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.9rem'};
    transition: background 0.2s;

    &:hover {
        background: ${({ theme }) => theme.hoverLight};
    }

    &:last-of-type {
        border-bottom: none;
    }
`;

// Add section/tab button
export const AddItemButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.xs};
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    background: transparent;
    border: 2px dashed ${({ theme }) => theme.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    color: ${({ theme }) => theme.textMuted};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.85rem'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: ${({ theme }) => theme.primary};
        color: ${({ theme }) => theme.primary};
    }
`;

// Right panel editor
export const EditorPanel = styled.div`
    background: ${({ theme }) => theme.hover};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.md};
    min-height: 400px;
`;

export const EditorTitle = styled.h6`
    margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
    color: ${({ theme }) => theme.text};
    font-weight: ${({ theme }) => theme.typography?.fontWeight?.semibold || '600'};
`;

export const FormGroup = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const Label = styled.label`
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.textMuted};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.85rem'};
`;

export const Input = styled.input`
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm};
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

export const Select = styled.select`
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.background};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 4px;
    color: ${({ theme }) => theme.text};
    font-size: ${({ theme }) => theme.typography?.fontSize?.sm || '0.85rem'};

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.primary};
    }

    option {
        background: ${({ theme }) => theme.background};
        color: ${({ theme }) => theme.text};
    }
`;

// Modal overlay
export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

export const ModalContent = styled.div`
    background: ${({ theme }) => theme.background};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.lg};
    min-width: 400px;
    max-width: 500px;
`;

export const ModalTitle = styled.h5`
    margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
    color: ${({ theme }) => theme.text};
`;

export const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.lg};
`;

// Empty state
export const EmptyState = styled.div`
    text-align: center;
    padding: ${({ theme }) => theme.spacing.xxl};
    color: ${({ theme }) => theme.textMuted};
`;

// Layout container
export const LayoutContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: ${({ theme }) => theme.spacing.lg};

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`;

export const MainContent = styled.div``;
