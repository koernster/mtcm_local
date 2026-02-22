import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCaseData, setLoading, setError } from '../store/slices/caseSetupSlice';
import { fetchCaseIsins, clearCaseIsins } from '../store/slices/caseIsinsSlice';
import CaseService from '../services/api/graphQL/cases/service';
import { RootState } from '../store/store';
import { Case } from '../services/api/graphQL/cases/types/case';
import { useCaseIsins } from './useCaseIsins';

export const useCaseSetup = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const dispatch = useDispatch();
    const { activeCaseId, loading, error, caseData } = useSelector((state: RootState) => state.caseSetup);
    
    // Get ISIN state from Redux store
    const { 
        uiEntries: isinEntries, 
        loading: isinsLoading, 
        error: isinsError,
        operationLoading
    } = useSelector((state: RootState) => state.caseIsins);
    
    // Get ISIN operation functions from hook
    const { 
        fetchISINs,
        createISIN, 
        updateISIN, 
        deleteISIN 
    } = useCaseIsins(caseId || null);

    useEffect(() => {
        const loadCaseData = async () => {
            if (!caseId) {
                // Clear ISINs when no case is selected
                dispatch(clearCaseIsins());
                return;
            }
            
            try {
                // Only load if we don't have the data or if it's for a different case
                if (!activeCaseId || activeCaseId !== caseId) {
                    dispatch(setLoading(true));
                    
                    // Load case data
                    const newCaseData = await CaseService.getInstance().getCaseById(caseId);
                    dispatch(setCaseData(newCaseData));
                    
                    // Load ISINs for this case (using Redux action)
                    dispatch(fetchCaseIsins(caseId) as any);
                }
            } catch (err) {
                dispatch(setError(err instanceof Error ? err.message : 'Failed to load case data'));
            }
        };

        loadCaseData();
    }, [caseId, dispatch, activeCaseId]);

    const updateCase = async (data: Partial<Case>, skipLoading = false) => {
        if (!activeCaseId) return;

        try {
            if (!skipLoading) {
                dispatch(setLoading(true));
            }
            const updatedCase = await CaseService.getInstance().updateCase(activeCaseId, data);
            dispatch(setCaseData(updatedCase));
        } catch (err) {
            dispatch(setError(err instanceof Error ? err.message : 'Failed to update case data'));
            throw err;
        } finally {
            if (!skipLoading) {
                dispatch(setLoading(false));
            }
        }
    };

    return {
        activeCaseId,
        loading,
        error,
        caseData,
        updateCase,
        // ISIN-related data from Redux and operations from hook
        isinEntries,
        isinsLoading,
        isinsError,
        operationLoading,
        fetchISINs,
        createISIN,
        updateISIN,
        deleteISIN
    };
};
