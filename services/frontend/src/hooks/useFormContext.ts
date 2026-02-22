import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { updateCaseData } from '../store/slices/caseSetupSlice';
import { useSaveOnBlur } from './useSaveOnBlur';
import { useCaseStatus } from './useCaseStatus';
import type { FormContextType } from '../types/dynamicForm';

/**
 * Centralized form context hook that provides all form operations.
 * 
 * Features:
 * - Wraps useSaveOnBlur for database persistence
 * - Manages loading and error states per field
 * - Provides value getters with nested path support
 * - Integrates with case freeze status
 * 
 * @param activeCaseId - The active case ID for saving operations
 */
export const useFormContext = (activeCaseId: string | null): FormContextType => {
    const dispatch = useDispatch();
    const caseData = useSelector((state: RootState) => state.caseSetup.caseData);
    const { isCaseFreezed } = useCaseStatus();

    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [errorStates, setErrorStates] = useState<Record<string, string>>({});

    const setFieldLoading = useCallback((field: string, loading: boolean) => {
        setLoadingStates((prev) => ({ ...prev, [field]: loading }));
    }, []);

    const setFieldError = useCallback((field: string, error: string | null) => {
        setErrorStates((prev) => ({ ...prev, [field]: error || '' }));
    }, []);

    const { handleBlur: saveOnBlur } = useSaveOnBlur({
        activeCaseId,
        setFieldLoading,
        setFieldError,
    });

    /**
     * Get value from case data.
     * Supports nested paths using dot notation (e.g., "company.companyname")
     */
    const getValue = useCallback(
        (key: string, nestedPath?: string): unknown => {
            if (nestedPath) {
                // Split path and navigate through object
                const parts = nestedPath.split('.');
                let value: unknown = caseData;
                for (const part of parts) {
                    if (value && typeof value === 'object') {
                        value = (value as Record<string, unknown>)[part];
                    } else {
                        return undefined;
                    }
                }
                return value;
            }
            return caseData?.[key as keyof typeof caseData];
        },
        [caseData]
    );

    /**
     * Handle field value change (updates Redux store only).
     * For database persistence, use handleBlur.
     */
    const handleChange = useCallback(
        (key: string, value: unknown, nestedPath?: string) => {
            if (nestedPath) {
                // For nested paths, build the update object
                const parts = nestedPath.split('.');
                const update: Record<string, unknown> = {};
                let current = update;

                for (let i = 0; i < parts.length - 1; i++) {
                    current[parts[i]] = {};
                    current = current[parts[i]] as Record<string, unknown>;
                }
                current[parts[parts.length - 1]] = value;

                dispatch(updateCaseData(update));
            } else {
                dispatch(updateCaseData({ [key]: value }));
            }
        },
        [dispatch]
    );

    /**
     * Handle field blur - triggers save to database via useSaveOnBlur.
     */
    const handleBlur = useCallback(
        async (key: string, value: unknown) => {
            await saveOnBlur(key, value);
        },
        [saveOnBlur]
    );

    /**
     * Get error message for a field.
     */
    const getError = useCallback(
        (key: string): string | undefined => {
            const error = errorStates[key];
            return error && error.length > 0 ? error : undefined;
        },
        [errorStates]
    );

    /**
     * Check if a field is loading.
     */
    const isLoading = useCallback(
        (key: string): boolean => loadingStates[key] || false,
        [loadingStates]
    );

    return useMemo(
        () => ({
            getValue,
            handleChange,
            handleBlur,
            getError,
            isLoading,
            disabled: isCaseFreezed,
            caseData,
            loadingStates,
            errorStates,
            dispatch,
            setFieldLoading,
            setFieldError,
        }),
        [
            getValue,
            handleChange,
            handleBlur,
            getError,
            isLoading,
            isCaseFreezed,
            caseData,
            loadingStates,
            errorStates,
            dispatch,
            setFieldLoading,
            setFieldError,
        ]
    );
};

export default useFormContext;
