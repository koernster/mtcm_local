import React from 'react';
import { Button } from 'react-bootstrap';
import { FaPrint } from 'react-icons/fa';

interface PrintButtonProps {
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'outline-primary' | 'outline-secondary' | 'outline-success';
    size?: 'sm' | 'lg';
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}

/**
 * Common print button component that can be used across the application
 * Provides consistent styling and behavior for print functionality
 */
const PrintButton: React.FC<PrintButtonProps> = ({
    onClick,
    variant = 'outline-success',
    size = 'sm',
    disabled = false,
    className = '',
    children = 'Print'
}) => {
    const handlePrint = () => {
        if (onClick) {
            onClick();
        } else {
            // Default print behavior
            window.print();
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handlePrint}
            disabled={disabled}
            className={className}
        >
            <FaPrint className="me-2" />
            {children}
        </Button>
    );
};

export default PrintButton;