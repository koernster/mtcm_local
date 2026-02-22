import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CaseIsin } from '../../services/api/graphQL/caseisins/types/caseisins';
import CaseIsinService from '../../services/api/graphQL/caseisins/service';
import { CouponInterestService } from '../../services/api/graphQL/couponinterest';
import { CouponStatus } from '../../types/couponStatus';
import { CouponTypes } from '../../types/CouponTypes';
import { generateUUID } from '../../lib/generateUUID';
import { Case } from '../../services/api/graphQL/cases';

// ISINEntry type that matches the UI component
export interface ISINEntry {
    id: string;
    isinNumber: string;
    valoren: string;
    issueSize: string; // Changed to string to match the UI component
    currencyid: string | null;
    currency: string;
    issuePrice: number;
    interestRate: number;
    couponRate: number;
}

interface CaseIsinsState {
    isins: CaseIsin[];
    uiEntries: ISINEntry[];
    loading: boolean;
    error: string | null;
    operationLoading: Record<string, boolean>; // For tracking individual ISIN operations
}

const initialState: CaseIsinsState = {
    isins: [],
    uiEntries: [],
    loading: false,
    error: null,
    operationLoading: {}
};

// Transform CaseIsin to ISINEntry for the UI component
export const transformToISINEntry = (caseIsin: CaseIsin): ISINEntry => ({
    id: caseIsin.id,
    isinNumber: caseIsin.isinnumber,
    valoren: caseIsin.valoren,
    issueSize: caseIsin.issuesize,
    currencyid: caseIsin.currencyid,
    currency: caseIsin.currency ? caseIsin.currency.currencyshortname : process.env.REACT_APP_DEFAULT_CURRENCY || 'CHF', 
    issuePrice: caseIsin.issueprice,
    interestRate: 0, // Default to 0, will be updated by fetchInterestRates
    couponRate: 0 // Default to 0, will be updated by fetchInterestRates
});

// Fetch interest rates for ISINs
export const fetchInterestRates = createAsyncThunk(
    'caseIsins/fetchInterestRates',
    async (isinIds: string[]) => {
        const ratesData: Record<string, { interestRate: number; couponRate: number }> = {};
        
        for (const isinId of isinIds) {
            const interestRecords = await CouponInterestService.getInstance().getCouponInterestByIsinId(isinId);
            const caseInterest = interestRecords.find(record => record.status === CouponStatus.CURRENT);
            if (caseInterest) {
                ratesData[isinId] = {
                    interestRate: caseInterest.interestrate,
                    couponRate: caseInterest.couponrate
                };
            }
        }
        
        return ratesData;
    }
);

// Transform ISINEntry to CaseIsin data for API calls
export const transformFromISINEntry = (entry: ISINEntry, caseid: string) => ({
    caseid,
    isinnumber: entry.isinNumber,
    valoren: entry.valoren,
    issuesize: entry.issueSize,
    currencyid: entry.currencyid,
    issueprice: entry.issuePrice,
    interestrate: entry.interestRate,
    couponrate: entry.couponRate
});

// Async thunks for API operations
export const fetchCaseIsins = createAsyncThunk(
    'caseIsins/fetchCaseIsins',
    async (caseid: string, { dispatch }) => {
        const isins = await CaseIsinService.getInstance().getCaseIsinsByCaseId(caseid);
        // After fetching ISINs, fetch their interest rates
        if (isins.length > 0) {
            dispatch(fetchInterestRates(isins.map(isin => isin.id)));
        }
        return isins;
    }
);

export const createCaseIsin = createAsyncThunk(
    'caseIsins/createCaseIsin',
    async ({ 
        caseid, 
        entry,
        couponTypeId 
    }: { 
        caseid: string; 
        entry: ISINEntry;
        couponTypeId: string | undefined;
    }) => {
        // Create the ISIN first
        const newIsin = await CaseIsinService.getInstance().createCaseIsin(
            entry.id, // Pass the generated ID
            caseid,
            entry.isinNumber,
            entry.valoren,
            entry.issueSize,
            entry.currencyid,
            entry.issuePrice
        );

        // If coupon type is Fixed and interest rate is provided, save it in couponinterest table
        if (couponTypeId === CouponTypes.FIXED && entry.interestRate !== undefined) {
            const id = generateUUID();
            await CouponInterestService.getInstance().createCouponInterest(
                id,
                newIsin.id,
                entry.interestRate,
                entry.couponRate,
                null,
                CouponStatus.CURRENT,
                CouponTypes.FIXED
            );
        }

        return {
            ...newIsin,
            interestRate: entry.interestRate,
            couponRate: entry.couponRate
        };
    }
);

export const updateCaseIsin = createAsyncThunk(
    'caseIsins/updateCaseIsin',
    async ({ 
        id, 
        field, 
        value,
        couponTypeId,
        issueDate
    }: { 
        id: string; 
        field: string; 
        value: any;
        couponTypeId?: string;
        issueDate?: string;
    }) : Promise<CaseIsin> => {
        // If updating interest rate, handle it separately
        if (field === 'interestRate') {
            // Get existing interest records for this ISIN
            const interestRecords = await CouponInterestService.getInstance().getCouponInterestByIsinId(id);
            const existingInterest = interestRecords.find(record => record.status === CouponStatus.CURRENT);

            if (existingInterest) {
                // Update existing interest rate
                await CouponInterestService.getInstance().updateOnlyInterestRate(existingInterest.id, value);
            } else {
                // Create new interest rate
                const couponInterestId = generateUUID();
                await CouponInterestService.getInstance().createCouponInterest(
                    couponInterestId,
                    id,
                    value,
                    undefined,
                    couponTypeId === CouponTypes.FIXED ? null : issueDate, // Set event date for non-fixed types
                    CouponStatus.CURRENT,
                    couponTypeId || CouponTypes.FIXED // Default to FIXED if couponTypeId is undefined
                );
            }

            // Return the ISIN without updating it
            return await CaseIsinService.getInstance().getCaseIsinById(id);
        }

        // If updating coupon rate, handle it separately
        if (field === 'couponRate') {
            // Get existing interest records for this ISIN
            const interestRecords = await CouponInterestService.getInstance().getCouponInterestByIsinId(id);
            const existingInterest = interestRecords.find(record => record.status === CouponStatus.CURRENT);

            if (existingInterest) {
                // Update existing coupon rate
                await CouponInterestService.getInstance().updateOnlyCouponRate(existingInterest.id, value);
            } else {
                // Create new coupon interest record with coupon rate
                const couponInterestId = generateUUID();
                await CouponInterestService.getInstance().createCouponInterest(
                    couponInterestId,
                    id,
                    0, // interestRate default
                    value, // couponRate
                    couponTypeId === CouponTypes.FIXED ? null : issueDate,
                    CouponStatus.CURRENT,
                    couponTypeId || CouponTypes.FIXED
                );
            }

            // Return the ISIN without updating it
            return await CaseIsinService.getInstance().getCaseIsinById(id);
        }

        // For other fields, update the ISIN as usual
        const fieldMapping: Record<string, string> = {
            isinNumber: 'isinnumber',
            valoren: 'valoren',
            issueSize: 'issuesize',
            currency: 'currencyid',
            issuePrice: 'issueprice'
            // Removed interestRate from mapping since it's handled separately
        };

        const dbFieldName = fieldMapping[field] || field;
        let dbValue = value;

        const updatedIsin = await CaseIsinService.getInstance().updateCaseIsin(id, {
            [dbFieldName]: dbValue
        });
        return updatedIsin;
    }
);
export const deleteCaseIsin = createAsyncThunk(
    'caseIsins/deleteCaseIsin',
    async (id: string) => {
        await CaseIsinService.getInstance().deleteCaseIsin(id);
        return id;
    }
);

const caseIsinsSlice = createSlice({
    name: 'caseIsins',
    initialState,
    reducers: {
        clearCaseIsins: (state) => {
            state.isins = [];
            state.uiEntries = [];
            state.loading = false;
            state.error = null;
            state.operationLoading = {};
        },
        setOperationLoading: (state, action: PayloadAction<{ id: string; loading: boolean }>) => {
            const { id, loading } = action.payload;
            state.operationLoading[id] = loading;
        },
        updateLocalIsinEntry: (state, action: PayloadAction<{ id: string; field: keyof ISINEntry; value: string | number }>) => {
            const { id, field, value } = action.payload;
            const entryIndex = state.uiEntries.findIndex(entry => entry.id === id);
            if (entryIndex !== -1) {
                state.uiEntries[entryIndex] = {
                    ...state.uiEntries[entryIndex],
                    [field]: value
                };
            }
        },
        syncUiEntriesWithIsins: (state) => {
            state.uiEntries = state.isins.map(transformToISINEntry);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch case ISINs
            .addCase(fetchCaseIsins.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCaseIsins.fulfilled, (state, action) => {
                state.loading = false;
                state.isins = action.payload;
                state.uiEntries = action.payload.map(transformToISINEntry);
                state.error = null;
            })
            // Handle interest rate fetching
            .addCase(fetchInterestRates.fulfilled, (state, action) => {
                const ratesData = action.payload;
                state.uiEntries = state.uiEntries.map(entry => ({
                    ...entry,
                    interestRate: ratesData[entry.id]?.interestRate || 0,
                    couponRate: ratesData[entry.id]?.couponRate || 0
                }));
            })
            .addCase(fetchCaseIsins.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch case ISINs';
            })

            // Create case ISIN
            .addCase(createCaseIsin.pending, (state) => {
                state.operationLoading['create'] = true;
            })
            .addCase(createCaseIsin.fulfilled, (state, action) => {
                state.operationLoading['create'] = false;
                const newIsinWithInterestRate = action.payload;
                state.isins.push(newIsinWithInterestRate);
                
                // Create UI entry with the correct interest rate and coupon rate from the payload
                const newUIEntry: ISINEntry = {
                    ...transformToISINEntry(newIsinWithInterestRate),
                    interestRate: newIsinWithInterestRate.interestRate || 0,
                    couponRate: newIsinWithInterestRate.couponRate || 0
                };
                state.uiEntries.push(newUIEntry);
                state.error = null;
            })
            .addCase(createCaseIsin.rejected, (state, action) => {
                state.operationLoading['create'] = false;
                state.error = action.error.message || 'Failed to create ISIN';
            })

            // Update case ISIN
            .addCase(updateCaseIsin.pending, (state, action) => {
                const { id } = action.meta.arg;
                state.operationLoading[id] = true;
            })
            .addCase(updateCaseIsin.fulfilled, (state, action) => {
                const updatedIsin = action.payload;
                const { id, field, value } = action.meta.arg;
                
                state.operationLoading[id] = false;
                
                // Update the ISIN in the isins array
                const isinIndex = state.isins.findIndex(isin => isin.id === updatedIsin.id);
                if (isinIndex !== -1) {
                    state.isins[isinIndex] = updatedIsin;
                }
                
                // Update the UI entry
                const entryIndex = state.uiEntries.findIndex(entry => entry.id === updatedIsin.id);
                if (entryIndex !== -1) {
                    if (field === 'interestRate') {
                        // For interest rate updates, manually update the UI entry to preserve the new value
                        state.uiEntries[entryIndex] = {
                            ...state.uiEntries[entryIndex],
                            interestRate: value
                        };
                    } else if (field === 'couponRate') {
                        // For coupon rate updates, manually update the UI entry to preserve the new value
                        state.uiEntries[entryIndex] = {
                            ...state.uiEntries[entryIndex],
                            couponRate: value
                        };
                    } else {
                        // For other fields, use the transform function
                        state.uiEntries[entryIndex] = {
                            ...transformToISINEntry(updatedIsin),
                            // Preserve the current interest rate and coupon rate from UI state
                            interestRate: state.uiEntries[entryIndex].interestRate,
                            couponRate: state.uiEntries[entryIndex].couponRate
                        };
                    }
                }
                
                state.error = null;
            })
            .addCase(updateCaseIsin.rejected, (state, action) => {
                const { id } = action.meta.arg;
                state.operationLoading[id] = false;
                state.error = action.error.message || 'Failed to update ISIN';
            })

            // Delete case ISIN
            .addCase(deleteCaseIsin.pending, (state, action) => {
                const id = action.meta.arg;
                state.operationLoading[id] = true;
            })
            .addCase(deleteCaseIsin.fulfilled, (state, action) => {
                const deletedId = action.payload;
                state.operationLoading[deletedId] = false;
                state.isins = state.isins.filter(isin => isin.id !== deletedId);
                state.uiEntries = state.uiEntries.filter(entry => entry.id !== deletedId);
                state.error = null;
            })
            .addCase(deleteCaseIsin.rejected, (state, action) => {
                const id = action.meta.arg;
                state.operationLoading[id] = false;
                state.error = action.error.message || 'Failed to delete ISIN';
            });
    }
});

export const { 
    clearCaseIsins, 
    setOperationLoading, 
    updateLocalIsinEntry, 
    syncUiEntriesWithIsins 
} = caseIsinsSlice.actions;

export default caseIsinsSlice.reducer;
