import React, { useMemo, memo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { KanbanContainer, StyledCardHeader, StyledCardBody } from '../styled/CommonStyled';
import DynamicField from './DynamicField';
import { CustomSectionRegistry } from './CustomSectionRegistry';
import type { SectionConfig, ConditionConfig, FormContextType } from '../../types/dynamicForm';
import type { OptionsRegistry } from '../../hooks/useOptionsRegistry';

interface DynamicSectionProps {
    /** Section configuration from profile */
    section: SectionConfig;
    /** Form context with all form operations */
    formContext: FormContextType;
    /** Options registry for select fields */
    optionsRegistry: OptionsRegistry;
}

/**
 * Evaluate a condition against case data.
 * Used for showWhen conditional visibility.
 */
const evaluateCondition = (
    condition: ConditionConfig,
    caseData: unknown
): boolean => {
    // Navigate to the field value using dot notation path
    const parts = condition.field.split('.');
    let value: unknown = caseData;

    for (const part of parts) {
        if (value && typeof value === 'object') {
            value = (value as Record<string, unknown>)[part];
        } else {
            value = undefined;
            break;
        }
    }

    // Evaluate condition
    if (condition.equals !== undefined) {
        return value === condition.equals;
    }
    if (condition.notEquals !== undefined) {
        return value !== condition.notEquals;
    }

    return true;
};

/**
 * DynamicSection Component
 * 
 * Renders a section which can be either:
 * - A grid of dynamic fields (type: 'fields')
 * - A custom component (type: 'custom')
 * 
 * Supports conditional visibility via showWhen property.
 * Memoized to prevent unnecessary re-renders when other sections change.
 */
const DynamicSectionInner: React.FC<DynamicSectionProps> = ({
    section,
    formContext,
    optionsRegistry,
}) => {
    // Calculate column size based on grid setting
    const colSize = 12 / (section.grid || 2);

    // Sort fields by position - ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS
    const sortedFields = useMemo(
        () => [...(section.fields || [])].sort((a, b) => a.position - b.position),
        [section.fields]
    );

    // Check conditional visibility - AFTER all hooks
    if (section.showWhen) {
        const shouldShow = evaluateCondition(section.showWhen, formContext.caseData);
        if (!shouldShow) {
            return null;
        }
    }

    // Render custom section
    if (section.type === 'custom' && section.customComponent) {
        const CustomComponent = CustomSectionRegistry[section.customComponent];
        if (CustomComponent) {
            return (
                <React.Suspense fallback={<div>Loading...</div>}>
                    <CustomComponent formContext={formContext} />
                </React.Suspense>
            );
        }
        console.warn(`DynamicSection: Unknown custom component "${section.customComponent}"`);
        return null;
    }

    // Render field content
    const fieldContent = (
        <Row>
            {sortedFields.map((fieldConfig) => (
                <Col key={fieldConfig.key} sm={fieldConfig.colSize || colSize}>
                    <DynamicField
                        config={fieldConfig}
                        formContext={formContext}
                        optionsRegistry={optionsRegistry}
                    />
                </Col>
            ))}
        </Row>
    );

    // Wrap in card if section has title
    if (section.title) {
        return (
            <Row className="mb-4">
                <Col sm={12}>
                    <KanbanContainer>
                        <StyledCardHeader>{section.title}</StyledCardHeader>
                        <StyledCardBody>{fieldContent}</StyledCardBody>
                    </KanbanContainer>
                </Col>
            </Row>
        );
    }

    // Return plain row without card wrapper
    return <Row className="mb-4">{fieldContent.props.children}</Row>;
};

// Memoize the component to prevent unnecessary re-renders
// Only re-render if section config or optionsRegistry changes
export const DynamicSection = memo(DynamicSectionInner, (prevProps, nextProps) => {
    // Re-render if section config changed
    if (prevProps.section !== nextProps.section) {
        return false;
    }
    // Re-render if optionsRegistry changed
    if (prevProps.optionsRegistry !== nextProps.optionsRegistry) {
        return false;
    }
    // Re-render if disabled state changed
    if (prevProps.formContext.disabled !== nextProps.formContext.disabled) {
        return false;
    }

    // For custom sections, always re-render when caseData changes
    // because custom components may depend on any part of caseData
    if (prevProps.section.type === 'custom') {
        if (prevProps.formContext.caseData !== nextProps.formContext.caseData) {
            return false;
        }
        // No changes detected for custom section
        return true;
    }

    // For regular field sections, check if any field values changed
    const sectionFields = prevProps.section.fields || [];
    for (const field of sectionFields) {
        const prevValue = prevProps.formContext.getValue(field.key);
        const nextValue = nextProps.formContext.getValue(field.key);
        if (prevValue !== nextValue) {
            return false;
        }
        // Check loading/error states
        if (prevProps.formContext.isLoading(field.key) !== nextProps.formContext.isLoading(field.key)) {
            return false;
        }
        if (prevProps.formContext.getError(field.key) !== nextProps.formContext.getError(field.key)) {
            return false;
        }
    }
    // Check showWhen condition if present
    if (prevProps.section.showWhen && nextProps.section.showWhen) {
        const prevParts = prevProps.section.showWhen.field.split('.');
        const nextParts = nextProps.section.showWhen.field.split('.');
        let prevValue: unknown = prevProps.formContext.caseData;
        let nextValue: unknown = nextProps.formContext.caseData;
        for (const part of prevParts) {
            prevValue = prevValue && typeof prevValue === 'object'
                ? (prevValue as Record<string, unknown>)[part]
                : undefined;
        }
        for (const part of nextParts) {
            nextValue = nextValue && typeof nextValue === 'object'
                ? (nextValue as Record<string, unknown>)[part]
                : undefined;
        }
        if (prevValue !== nextValue) {
            return false;
        }
    }
    // No changes detected, don't re-render
    return true;
});

export default DynamicSection;

