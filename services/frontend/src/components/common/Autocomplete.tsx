import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import styled from 'styled-components';
import { ListGroup } from 'react-bootstrap';
import { StyledFormControl } from '../styled/CommonStyled';
import { FaExclamationTriangle } from 'react-icons/fa';
import InputWrapper from './InputWrapper';

interface AutocompleteProps<T> {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  onSearch: (query: string) => Promise<T[]>;
  getOptionLabel: (option: T) => string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minLength?: number;
  debounceMs?: number;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  textElementStyle?: React.CSSProperties;
  onBlur?: (value: string) => void;
  onCreateNew?: (value: string) => void | Promise<void>;
  createNewLabel?: string;
}

const StyledListGroup = styled(ListGroup)`
  position: absolute;
  width: 100%;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.border};
  border-radius: ${props => props.theme.borderRadius};
  margin-top: 4px;
  background: ${props => props.theme.background};

  .list-group-item {
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
    border-color: ${props => props.theme.border};
    cursor: pointer;
    padding: ${props => props.theme.padding};

    &:hover {
      background: ${props => props.theme.hover};
    }

    &.active {
      background: ${props => props.theme.primary};
      color: white;
      border-color: ${props => props.theme.primary};
    }
  }
`;

const Container = styled.div`
  position: relative;
`;

const CreateNewHint = styled.div`
  padding: ${props => props.theme.padding};
  color: ${props => props.theme.textMuted || '#6c757d'};
  font-size: 0.875rem;
  font-style: italic;
  border-top: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.background};
  text-align: center;
`;


export function Autocomplete<T>({
  value,
  onChange,
  onSelect,
  onSearch,
  onBlur,
  getOptionLabel,
  placeholder,
  className,
  disabled = false,
  minLength = 2,
  debounceMs = 300,
  loading = false,
  error = false,
  errorMessage,
  textElementStyle = {},
  onCreateNew,
  createNewLabel = "Press Enter to create",
}: AutocompleteProps<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key for creating new item even when dropdown is closed
    if (e.key === 'Enter' && !isOpen && onCreateNew && inputValue.trim().length >= minLength) {
      e.preventDefault();
      onCreateNew(inputValue.trim());
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev =>
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev =>
          prev > 0 ? prev - 1 : -1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length) {
          handleOptionSelect(options[activeIndex]);
        } else if (onCreateNew && inputValue.trim().length >= minLength && options.length === 0) {
          // Create new item if no options available
          onCreateNew(inputValue.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < minLength) {
      setOptions([]);
      setIsOpen(false);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const results = await onSearch(query);
        setOptions(results);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching autocomplete options:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue); // Only update local state
    handleSearch(newValue);
    setActiveIndex(-1);
  };

  const handleOptionSelect = (option: T) => {
    const newValue = getOptionLabel(option);
    setInputValue(newValue);
    onChange(newValue); // Update parent state only on selection
    onSelect(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <Container ref={containerRef} className={className}>
      <InputWrapper
        isLoading={isLoading || loading}
        rightIcon={error ? <FaExclamationTriangle size={16} title={errorMessage} style={{ color: 'var(--bs-warning)' }} /> : undefined}
      >
        <StyledFormControl
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Allow a small delay for option click to register before closing
            setTimeout(() => {
              if (onBlur) onBlur(inputValue);
            }, 200);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          style={{
            ...(isLoading || loading ? { cursor: 'wait' } : {}),
            ...(error ? { borderBottomColor: 'var(--bs-warning)' } : {}),
            ...(textElementStyle || {})
          }}
        />
      </InputWrapper>
      {isOpen && options.length > 0 && (
        <StyledListGroup>
          {options.map((option, index) => (
            <ListGroup.Item
              key={index}
              action
              active={index === activeIndex}
              onClick={() => handleOptionSelect(option)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {getOptionLabel(option)}
            </ListGroup.Item>
          ))}
        </StyledListGroup>
      )}
      {isOpen && options.length === 0 && onCreateNew && inputValue.trim().length >= minLength && !loading && !isLoading && (
        <StyledListGroup>
          <CreateNewHint>
            {createNewLabel}: "{inputValue}"
          </CreateNewHint>
        </StyledListGroup>
      )}
    </Container>
  );
}

export default Autocomplete;
