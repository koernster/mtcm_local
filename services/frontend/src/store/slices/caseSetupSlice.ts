import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Case } from '../../services/api/graphQL/cases/types/case';

interface BasketAsset {
    id: string;
    assetname: string;
    assetvalue: number;
    valuetype: number;
    caseid?: string | null;
}

interface CaseSetupState {
    activeCaseId: string | null;
    loading: boolean;
    error: string | null;
    caseData: Case | null;
}

const initialState: CaseSetupState = {
    activeCaseId: null,
    loading: true,
    error: null,
    caseData: null
};

const caseSetupSlice = createSlice({
    name: 'caseSetup',
    initialState,
    reducers: {
        setCaseData: (state, action: PayloadAction<Case>) => {
            state.activeCaseId = action.payload.id;
            state.caseData = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearCaseData: (state) => {
            state.activeCaseId = null;
            state.caseData = null;
            state.loading = false;
            state.error = null;
        },
        updateCaseData: (state, action: PayloadAction<Partial<Case>>) => {
            if (state.caseData) {
                state.caseData = { ...state.caseData, ...action.payload };
            }
        },
        addBasketAsset: (state, action: PayloadAction<BasketAsset>) => {
            if (state.caseData) {
                if (!state.caseData.case_assetbaskets) {
                    state.caseData.case_assetbaskets = [];
                }
                state.caseData.case_assetbaskets.push(action.payload);
            }
        },
        removeBasketAsset: (state, action: PayloadAction<number>) => {
            if (state.caseData && state.caseData.case_assetbaskets) {
                state.caseData.case_assetbaskets.splice(action.payload, 1);
            }
        },
        updateBasketAsset: (state, action: PayloadAction<{ index: number; asset: BasketAsset }>) => {
            if (state.caseData && state.caseData.case_assetbaskets) {
                const { index, asset } = action.payload;
                if (index >= 0 && index < state.caseData.case_assetbaskets.length) {
                    state.caseData.case_assetbaskets[index] = asset;
                }
            }
        },
        setBasketAssets: (state, action: PayloadAction<BasketAsset[]>) => {
            if (state.caseData) {
                state.caseData.case_assetbaskets = action.payload;
            }
        }
    }
});

export const { 
    setCaseData, 
    setLoading, 
    setError, 
    clearCaseData,
    updateCaseData,
    addBasketAsset,
    removeBasketAsset,
    updateBasketAsset,
    setBasketAssets
} = caseSetupSlice.actions;

export default caseSetupSlice.reducer;
