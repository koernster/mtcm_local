import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export const renderWarningMessage = (errorMessage: string | undefined): JSX.Element | undefined => {
    return errorMessage ? (
        <FaExclamationTriangle 
            size={16} 
            title={errorMessage} 
            style={{ color: 'var(--bs-warning)' }} 
        />
    ) : undefined;
};

export const hasFieldError = (error: string | undefined): boolean => {
    return !!error;
};

export const getFieldErrorStyle = (error: string | undefined): React.CSSProperties | undefined => {
    return error ? { borderBottomColor: 'var(--bs-warning)' } : undefined;
};
