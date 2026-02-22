import React, { CSSProperties } from 'react';
import { Toast } from 'react-bootstrap';
import { createRoot, type Root } from 'react-dom/client';
import { useTheme, ThemeContextProvider } from '../context/ThemeContext';

interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  icon?: React.ReactNode;
  title?: string;
  message: React.ReactNode;
  duration?: number;
  position?: 'top' | 'middle' | 'bottom';
  className?: string;
}

interface ToastState {
  id: string;
  options: ToastOptions;
}

let toasts: ToastState[] = [];
let toastRoot: Root | null = null;
const DEFAULT_DURATION = 3000;

// Create a container for toasts if it doesn't exist
const createContainer = () => {
  const containerId = 'toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  return container;
};

const ToastComponent: React.FC<{ toasts: ToastState[]; onDismiss: (id: string) => void }> = ({ 
  toasts, 
  onDismiss 
}) => {
  const { theme } = useTheme();

  const getContainerStyle = (position?: string): CSSProperties => {
    const base: CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none'
    };

    switch (position) {
      case 'top':
        return { ...base, top: '20px' };
      case 'middle':
        return { ...base, top: '50%', transform: 'translateY(-50%)' };
      case 'bottom':
        return { ...base, bottom: '20px' };
      default:
        return { ...base, bottom: '20px', left: '20px' };
    }
  };

  const toastStyle = (type: string): CSSProperties => ({
    backgroundColor: theme.background,
    color: theme.text,
    border: `1px solid ${
      type === 'success' ? theme.success :
      type === 'error' ? theme.warning :
      type === 'warning' ? theme.warning :
      theme.primary
    }`,
    minWidth: '300px',
    maxWidth: '500px',
    pointerEvents: 'auto'
  });

  return (
    <div style={getContainerStyle(toasts[0]?.options.position)}>
      {toasts.map(({ id, options }) => (
        <Toast
          key={id}
          onClose={() => onDismiss(id)}
          show={true}
          delay={options.duration || DEFAULT_DURATION}
          autohide={options.duration !== Infinity}
          className={`mb-2 ${options.className || ''}`}
          style={toastStyle(options.type)}
        >
          {options.title && (
            <Toast.Header closeButton={options.duration !== Infinity}>
              <span className="me-2">{options.icon}</span>
              <strong className="me-auto">{options.title}</strong>
            </Toast.Header>
          )}
          {!options.title && options.icon && (
            <span className="me-2">{options.icon}</span>
          )}
          {options.message && (
            <Toast.Body>{options.message}</Toast.Body>
          )}
        </Toast>
      ))}
    </div>
  );
};

const ToastWrapper: React.FC<{ toasts: ToastState[]; onDismiss: (id: string) => void }> = (props) => {
  return (
    <ThemeContextProvider>
      <ToastComponent {...props} />
    </ThemeContextProvider>
  );
};

const renderToasts = () => {
  const container = createContainer();
  
  if (!toastRoot) {
    toastRoot = createRoot(container);
  }
  
  toastRoot.render(
    <ToastWrapper
      toasts={toasts}
      onDismiss={(id) => showToast.dismiss(id)}
    />
  );
};

const showToast = (options: ToastOptions): string => {
  const id = Math.random().toString(36).substring(2, 9);
  toasts = [...toasts, { id, options }];
  renderToasts();
  
  if (options.duration !== Infinity) {
    setTimeout(() => {
      showToast.dismiss(id);
    }, options.duration || DEFAULT_DURATION);
  }
  
  return id;
};

showToast.dismiss = (id: string): void => {
  toasts = toasts.filter(toast => toast.id !== id);
  renderToasts();
};

export default showToast;
