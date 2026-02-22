import React from 'react';
import { Alert } from 'react-bootstrap';
import { FaExclamationCircle } from 'react-icons/fa';

interface ErrorProps {
  message: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

const Error: React.FC<ErrorProps> = ({ message, variant = 'danger' }) => {
  return (
    <Alert variant={variant} style={{ width: '100%' }}>
      <p><FaExclamationCircle size="25"></FaExclamationCircle> {message}</p>
    </Alert>
  );
};

export default Error;
