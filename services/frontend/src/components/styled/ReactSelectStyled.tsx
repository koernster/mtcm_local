import React from 'react';
import Select, { ActionMeta, OnChangeValue } from 'react-select';
import { useTheme } from '../../context/ThemeContext';

interface GroupOption {
    value: string;
    label: string;
}

interface ReactSelectProps {
    isMulti: boolean;
    placeholder: string, 
    isSearchable: boolean;
    options: GroupOption[];
    value: GroupOption[];
    onChange: (newValue: OnChangeValue<GroupOption, boolean>, actionMeta: ActionMeta<GroupOption>) => void;
}

const ReactSelectStyled: React.FC<ReactSelectProps> = ({ isMulti, isSearchable, placeholder, options, value, onChange }) => {
    const { theme } = useTheme();
    const customSelectStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: theme.background,            borderColor: theme.border,
            borderBottom: `2px solid ${theme.border}`,
            color: theme.text,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                borderColor: theme.default,
            },
            '&:focus-within': {
                borderColor: theme.default,
                borderBottom: `2px solid ${theme.default}`,
                boxShadow: 'none',
            },
        }),
        option: (provided: any, state: any) => ({
            ...provided,            backgroundColor: state.isSelected ? theme.default : theme.background,
            color: state.isSelected ? '#ffffff' : theme.text,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: state.isSelected ? theme.defaultHover : theme.hoverLight,
                color: state.isSelected ? '#ffffff' : theme.text,
            },
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            color: theme.text,
        }),
        multiValue: (provided: any) => ({
            ...provided,
            background: theme.selectValueBackground,
            transition: 'all 0.2s ease-in-out',
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: theme.text,
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            color: theme.text,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: theme.warning,
                color: '#ffffff',
            },
        }),
        singleValue:(provided: any, state: any) => ({
            ...provided,
            color: theme.text,
        }),
        input:(provided: any, state: any) => ({
            ...provided,
            color: theme.text,
        }),
        placeholder:(provided: any, state: any) => ({
            ...provided,
            color: theme.text,
        }),
    };

    return (
        <Select
            isMulti={isMulti}
            isSearchable={isSearchable}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            styles={customSelectStyles}
        />
    );
};

export default ReactSelectStyled;
