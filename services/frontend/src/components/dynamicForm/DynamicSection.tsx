import React, { useMemo } from 'react';
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
 */
export const DynamicSection: React.FC<DynamicSectionProps> = ({
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

export default DynamicSection;
