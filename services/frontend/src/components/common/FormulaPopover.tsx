import React from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import { FaSquareRootVariable } from 'react-icons/fa6';
import { useTheme } from '../../context/ThemeContext';
import { StyledPopover, StyledPopoverHeader, StyledPopoverBody } from '../styled/CommonStyled';

interface FormulaPopoverProps {
    title: string;
    formula: string;
    description: string;
    variables?: { [key: string]: string };
    trigger?: string | string[];
    placement?: 'top' | 'bottom' | 'left' | 'right';
    children?: React.ReactNode;
}

const FormulaPopover: React.FC<FormulaPopoverProps> = ({ 
    title, 
    formula, 
    description, 
    variables, 
    trigger = ['hover', 'focus'],
    placement = 'left',
    children 
}) => {
    const { theme } = useTheme();

    const popover = (
        <StyledPopover
            id={`formula-popover-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
            <StyledPopoverHeader as="h6">
                {title} Formula
            </StyledPopoverHeader>
            <StyledPopoverBody>
                <div className="mb-2">
                    <strong>Formula:</strong>
                    <pre style={{ marginTop: '4px' }}>
                        {formula}
                    </pre>
                </div>
                
                <div className="mb-2">
                    <strong>Description:</strong>
                    <div style={{ marginTop: '4px', lineHeight: '1.4' }}>
                        {description}
                    </div>
                </div>

                {variables && Object.keys(variables).length > 0 && (
                    <div>
                        <strong>Variables:</strong>
                        <ul style={{ marginTop: '4px', marginBottom: '0' }}>
                            {Object.entries(variables).map(([variable, meaning]) => (
                                <li key={variable} style={{ marginBottom: '2px' }}>
                                    <code>{variable}</code>: {meaning}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </StyledPopoverBody>
        </StyledPopover>
    );

    return (
        <OverlayTrigger 
            trigger={trigger as any} 
            placement={placement as any} 
            overlay={popover}
        >
            <span
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'inline-block', cursor: 'pointer' }}
            >
                {children || (
                    <span>
                        <FaSquareRootVariable 
                            style={{ 
                                color: theme.primary,
                                cursor: 'pointer',
                                marginLeft: '4px',
                                fontSize: '0.8rem'
                            }}
                            title={`${title} Formula`}
                        />
                    </span>
                )}
            </span>
        </OverlayTrigger>
    );
};

export default FormulaPopover;
