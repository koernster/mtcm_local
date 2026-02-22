import React from 'react';
import DynamicSection from './DynamicSection';
import { useFormContext } from '../../hooks/useFormContext';
import { useOptionsRegistry } from '../../hooks/useOptionsRegistry';
import { useCaseSetup } from '../../hooks/useCaseSetup';
import type { TabConfig } from '../../types/dynamicForm';

interface DynamicFormRendererProps {
    /** Tab configuration containing sections to render */
    tabConfig: TabConfig | null | undefined;
    /** Override default loading state */
    loading?: boolean;
}

/**
 * DynamicFormRenderer Component
 * 
 * Main component for rendering dynamic form sections from product profile configuration.
 * 
 * Features:
 * - Renders all sections from tab configuration
 * - Provides form context to all child fields
 * - Resolves dropdown options via options registry
 * 
 * Note: This component renders ONLY dynamic sections.
 * Fixed fields (Client, SPV, Product Type, etc.) should be rendered
 * by the parent component before calling DynamicFormRenderer.
 */
export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
    tabConfig,
    loading = false,
}) => {
    const { activeCaseId } = useCaseSetup();
    const formContext = useFormContext(activeCaseId);
    const optionsRegistry = useOptionsRegistry();

    // Parent handles skeleton loading, we just return null if loading or no config
    if (loading || !tabConfig) {
        return null;
    }

    return (
        <>
            {tabConfig.sections.map((section) => (
                <DynamicSection
                    key={section.id}
                    section={section}
                    formContext={formContext}
                    optionsRegistry={optionsRegistry}
                />
            ))}
        </>
    );
};

export default DynamicFormRenderer;
