import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';

interface InputWrapperProps {
    children: ReactNode;
    leftIcon?: ReactNode;
    isLoading?: boolean;
    className?: string;
    rightIcon?: ReactNode;
    style?: React.CSSProperties;
}

const Container = styled.div`
    position: relative;
    display: flex;
    flex: 1;
`;

const IconContainer = styled.div<{ position: 'left' | 'right' }>`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${props => props.position === 'left' ? 'left: 10px;' : 'right: 10px;'}
    display: flex;
    align-items: center;
    color: ${props => props.theme.textMuted};
    z-index: 1;
`;

// This will apply padding to any input element within the wrapper
const InputContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => {
    // Don't forward custom props to the DOM
    return prop !== 'hasLeftIcon' && prop !== 'hasRightIcon';
  }
})<{ hasLeftIcon?: boolean; hasRightIcon?: boolean }>`
    flex: 1;
    > input, > select, > textarea {
        padding-left: ${props => props.hasLeftIcon ? '32px' : '12px'} !important;
        padding-right: ${props => props.hasRightIcon ? '32px' : '12px'} !important;
    }
`;

const InputWrapper: React.FC<InputWrapperProps> = ({
    children,
    leftIcon,
    isLoading,
    rightIcon,
    className,
    style
}) => {
    return (
        <Container className={className} style={{
            ...style,
            ...(isLoading ? { cursor: 'wait' } : { cursor: 'text' })
        }}>
            {leftIcon && (
                <IconContainer position="left">
                    {leftIcon}
                </IconContainer>
            )}
            
            <InputContainer 
                hasLeftIcon={!!leftIcon} 
                hasRightIcon={!!(isLoading || rightIcon)}
            >
                {children}
            </InputContainer>

            {(isLoading || rightIcon) && (
                <IconContainer position="right">
                    {isLoading ? (
                        <Spinner 
                            animation="border" 
                            size="sm" 
                            style={{ width: '16px', height: '16px' }}
                        />
                    ) : rightIcon}
                </IconContainer>
            )}
        </Container>
    );
};

export default InputWrapper;
