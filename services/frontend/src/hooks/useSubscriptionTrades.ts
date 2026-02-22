import { useState, useEffect, useCallback } from 'react';
import SubscriptionTradeService from '../services/api/graphQL/subscriptionTrades/service';
import { uploadExcelToExtractor } from '../services/api/excelExtractor/service';
import { ExtractorResponse, ExtractorErrorResult, ExtractorTrade } from '../services/api/excelExtractor/types';
import { TradeService } from '../services/api/graphQL/trade';
import { SubscriptionTrade, SubscriptionTradesData } from '../services/api/graphQL/subscriptionTrades/types/subscriptionTrades';
import { TradeInsert, TradeUpdate } from '../services/api/graphQL/trade/types/trade';
import { generateUUID } from '../lib/generateUUID';
import { CaseIsinService } from '../services/api/graphQL/caseisins';
import { CaseIsin } from '../services/api/graphQL/cases';
import { dateUtils } from '../utils/formatters';

// Private method to validate extractor response
const _validateExtractorResponse = (response: ExtractorResponse, isins: CaseIsin[]): string[] | null => {
    // 1. All Sheets should have any error (if error result)
    if (Array.isArray(response) && response.length > 0 && 'error' in response[0]) {
        // Error result: every sheet should have an error
        const haveError = response.some((item: any) => item.error && item.sheet);
        if (haveError) {
            // Group errors by error message and list sheets per error
            const errorGroups: Record<string, string[]> = {};
            (response as ExtractorErrorResult[]).forEach(item => {
                if (!errorGroups[item.error]) errorGroups[item.error] = [];
                errorGroups[item.error].push(item.sheet);
            });

            return Object.entries(errorGroups).map(
                ([error, sheets]) => `Sheets [${sheets.join(', ')}]: ${error}`
            );
        }
    }

    // 2. All Sheet have a body data and at least one entry (if success result)
    if (Array.isArray(response) && response.length > 0) {
        const allHaveBody = response.every((sheet: any) => sheet.body && Array.isArray(sheet.body) && sheet.body.length > 0);
        if (!allHaveBody) 
            return [`Sheet "${response.filter((sheet: any) => !Array.isArray(sheet.body) || sheet.body.length === 0).map(sheet => sheet.sheet).join(', ') || ''}": no entries found!`];
        
        // 3. All entries should have sheet name
        const allEntriesHaveSheet = response.every((sheet: any) =>
            sheet.body.every((entry: any) => sheet.sheet)
        );
        if (!allEntriesHaveSheet) return ['Some does not have a name.'];
    }

    //4. All sheets should have  ISINNumber and it should match with trades
    if (Array.isArray(response) && response.length > 0) {
        const allHaveISIN = response.filter((sheet: any) => !sheet.header || !sheet.header.ISINNumber);
        if (allHaveISIN && allHaveISIN.length > 0) 
            return [`Sheet "${JSON.stringify(allHaveISIN) || ''}": Missing ISINNumber in header.`];
        
        // Check if ISINs match with trades where it has currentTrades
        const isinSet = new Set(isins.map(isin => isin.isinnumber));
        
        const hasNonMatchISIN = response.filter((sheet: any) => sheet.header 
                    && sheet.header.ISINNumber 
                    && !isinSet.has(sheet.header.ISINNumber));

        if (hasNonMatchISIN && hasNonMatchISIN.length > 0) {
            return [`Sheet [${hasNonMatchISIN.map(sheet => sheet.sheet).join(', ') || ''}]: ISINNumber does not match with the compartment.`];
        }   
    }

    return null;
};

const _preapreSubscriptionsToInsertOrCancel = (response: ExtractorResponse, trades: SubscriptionTrade[],isins: CaseIsin[], issueDate: string|null) => {
    const subscriptionsToInsert: TradeInsert[] = [];
    const cancellationsToInsert: { id: string; data: TradeUpdate }[] = [];

    // Map response sheets to trades by ISINNumber
    const isinToTradeMap: Record<string, SubscriptionTrade[]> = {};
    trades.forEach(trade => {
        if (trade.isinnumber) {
            if (!isinToTradeMap[trade.isinnumber]) {
                isinToTradeMap[trade.isinnumber] = [];
            }
            isinToTradeMap[trade.isinnumber].push(trade);
        }
    });

    response.forEach((sheet: any) => {
        const isinNumber = sheet.header?.ISINNumber;
        if (isinNumber) {
            const tradesForISIN = isinToTradeMap[isinNumber];
            //get the isinID by number
        const isinRecord = isins.find(isin => isin.isinnumber === isinNumber);
            if(!isinRecord){
                // This should not happen due to prior validation, but just in case
                console.warn(`No ISIN record found for ISINNumber: ${isinNumber}`);
                return;
            }

            // Prepare subscription data to insert
            const positiveEntries = sheet.body.filter((entry: ExtractorTrade) => entry.notional > 0 && !entry.subscriptionCancelled);
            positiveEntries.forEach((entry: ExtractorTrade) => {
                if(tradesForISIN){
                    const tradeExists = tradesForISIN.find(trade => {
                            return (
                                trade.notional === entry.notional &&
                                dateUtils.isSameDay(trade.tradedate, entry.tradeDate) &&
                                trade.counterparty === entry.counterParty
                            );
                        });

                    //if trade does not exists then prepare it for insertion.
                    if (!tradeExists) {
                        subscriptionsToInsert.push({
                            id: generateUUID(),
                            isinid: isinRecord.id, // Use existing ISIN ID if available
                            bank_investor: '',
                            counterparty: entry.counterParty || '',
                            notional: entry.notional,
                            price_dirty: 0,
                            reference: '',
                            tranfee: 0,
                            tradedate: entry.tradeDate,
                            valuedate: issueDate || entry.tradeDate,
                            tradetype: 1,
                            transtatus: 1,
                        });
                    }
                } else {
                    subscriptionsToInsert.push({
                        id: generateUUID(),
                        isinid: isinRecord.id,
                        bank_investor: '',
                        counterparty: entry.counterParty || '',
                        notional: entry.notional,
                        price_dirty: 0,
                        reference: '',
                        tranfee: 0,
                        tradedate: entry.tradeDate,
                        valuedate: issueDate || entry.tradeDate,
                        tradetype: 1,
                        transtatus: 1,
                    });
                }
            });

            if(tradesForISIN){
                // Prepare cancellation data to insert
                const negativeEntries = sheet.body.filter((entry: ExtractorTrade) => entry.notional < 0 && entry.subscriptionCancelled);
                negativeEntries.forEach((entry: ExtractorTrade) => {
                    const tradeToCancel = tradesForISIN.find(trade => {
                            return (
                                trade.notional === Math.abs(entry.notional) &&
                                dateUtils.isSameDay(trade.tradedate, entry.tradeDate) &&
                                trade.counterparty === entry.counterParty
                            );
                        });

                if (tradeToCancel) {
                    cancellationsToInsert.push({
                        id: tradeToCancel.id,
                            data: {
                                transtatus: 3 // Assuming '3' is the status for cancelled trades
                            }
                    });
                }
                });
            }
        }
    });

    return { subscriptionsToInsert, cancellationsToInsert };
};

interface SaveOnBlurConfig {
    setFieldLoading: (field: string, isLoading: boolean) => void;
    setFieldError: (field: string, error: string | null) => void;
    onSuccess?: (field: string, value: any, tradeId: string) => void;
    onError?: (field: string, error: Error, tradeId: string) => void;
}

const isValidValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    if (typeof value === 'boolean') return true;
    return true;
};

// Helper function to parse trade field information
const parseTradeField = (field: string): { tradeId: string; fieldName: string } | null => {
    // Expected format: "fieldName-tradeId" (e.g., "bank_investor-123", "notional-456")
    const parts = field.split('-');
    if (parts.length >= 2) {
        const fieldName = parts[0];
        const tradeId = parts.slice(1).join('-'); // In case the ID contains hyphens
        return { tradeId, fieldName };
    }
    return null;
};

/**
 * Custom hook for managing subscription trades data for a specific case.
 * 
 * Features:
 * - Fetches current and historical subscription trades
 * - Updates subscription trades (automatically sets trantype to modified)
 * - Save individual trade fields on blur
 * - Loading states
 * - Error handling
 * - Automatic refetch when case ID changes
 * 
 * @param caseId - The case ID to fetch subscription trades for
 * @param saveOnBlurConfig - Configuration for save-on-blur functionality
 * @returns {Object} An object containing:
 *   - currentTrades: Array of current SubscriptionTrade objects (trade_rank = 1)
 *   - historicalTrades: Array of historical SubscriptionTrade objects (trade_rank > 1)
 *   - loading: Boolean indicating if data is being loaded
 *   - updating: Boolean indicating if a trade is being updated
 *   - error: Error object if any error occurred
 *   - updateTrade: Function to update a trade
 *   - handleBlur: Function to handle field blur events for auto-save
 */
export const useSubscriptionTrades = (caseId: string, issueDate: string|null, saveOnBlurConfig?: SaveOnBlurConfig) => {
    const [currentTrades, setCurrentTrades] = useState<SubscriptionTrade[]>([]);
    const [soldTrades, setSoldTrades] = useState<SubscriptionTrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // ISIN upload workflow state
    const [isinUploadStage, setIsinUploadStage] = useState<'idle'|'uploading'|'validating'|'preparing'|'saving'|'done'|'error'|'warning'|'norecords'>('idle');
    const [isinUploadError, setIsinUploadError] = useState<string|string[]|null>(null);
    
    const subscriptionTradeService = SubscriptionTradeService.getInstance();
    
    const { 
        setFieldLoading, 
        setFieldError, 
        onSuccess, 
        onError 
    } = saveOnBlurConfig || {};

    /**
     * Fetches subscription trades from the server for the given case ID
     * @param targetCaseId - The case ID to fetch trades for
     * @returns Promise with current and historical trades
     */
    const fetchSubscriptionTrades = useCallback(async (targetCaseId: string) => {
        try {
            const result = await subscriptionTradeService.getSubscriptionTradesByCaseId(targetCaseId);
            return result;
        } catch (err) {
            throw err;
        }
    }, [subscriptionTradeService]);

    /**
     * Loads subscription trades with proper state management
     * 
     * State Management:
     * - Handles loading states
     * - Updates trades arrays
     * - Manages error states
     */
    const loadSubscriptionTrades = useCallback(async () => {
        if (!caseId) {
            setCurrentTrades([]);
            setSoldTrades([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { currentTrades: newCurrentTrades, soldTrades: newSoldTrades } = 
                await fetchSubscriptionTrades(caseId);
            
            setCurrentTrades(newCurrentTrades);
            setSoldTrades(newSoldTrades);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load subscription trades'));
            setCurrentTrades([]);
            setSoldTrades([]);
        } finally {
            setLoading(false);
            setSelectedFile(null);
        }
    }, [caseId, fetchSubscriptionTrades]);

    // Load subscription trades when case ID changes
    useEffect(() => {
        loadSubscriptionTrades();
        
        if(isinUploadStage !== 'saving'){
            setSelectedFile(null);
            setIsinUploadStage('idle');
            setIsinUploadError(null);
        }

    }, [loadSubscriptionTrades]);

    /**
     * Updates a subscription trade
     * @param tradeId - The ID of the trade to update
     * @param updateData - The data to update the trade with
     * @returns Promise that resolves when update is complete
     */
    const updateTrade = useCallback(async (tradeId: string, updateData: TradeUpdate) => {
        try {
            setUpdating(true);
            setError(null);

            await TradeService.updateTrade(tradeId, updateData);
            
            // Refetch trades to get updated data
            await loadSubscriptionTrades();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update trade'));
            throw err;
        } finally {
            setUpdating(false);
        }
    }, [loadSubscriptionTrades]);

    /**
     * Handle blur event for trade form fields to save them to the database
     * @param field - The field name in format "fieldName-tradeId" (e.g., "bank_investor-123")
     * @param value - The value to save
     */
    const handleBlur = useCallback(async (field: string, value: any) => {
        if (!setFieldLoading || !setFieldError) {
            console.warn('Save on blur not configured. Provide saveOnBlurConfig to enable auto-save.');
            return;
        }

        // Skip if the value is not valid (null, empty string, or just whitespace)
        if (!isValidValue(value)) {
            setFieldError(field, 'Value cannot be empty');
            return;
        }

        const tradeFieldInfo = parseTradeField(field);
        if (!tradeFieldInfo) {
            setFieldError(field, 'Invalid trade field format. Expected: fieldName-tradeId');
            return;
        }

        const { tradeId, fieldName } = tradeFieldInfo;

        setFieldLoading(field, true);
        setFieldError(field, null);

        try {
            // Update the trade field
            await TradeService.updateTrade(tradeId, {
                [fieldName]: value
            });

            // Refetch trades to get updated data
            await loadSubscriptionTrades();

            onSuccess?.(field, value, tradeId);
        } catch (error) {
            const errorMessage = `Failed to save ${fieldName}. Please try again.`;
            setFieldError(field, errorMessage);
            onError?.(field, error instanceof Error ? error : new Error(errorMessage), tradeId);
        } finally {
            setFieldLoading(field, false);
        }
    }, [setFieldLoading, setFieldError, onSuccess, onError, loadSubscriptionTrades]);

    /**
     * Multi-step ISIN upload workflow
     * @param file - Excel file to upload
     * @returns Promise<void>
     */
    const uploadIsinsWorkflow = useCallback(async (file: File) => {
        setSelectedFile(file);
        setIsinUploadStage('uploading');
        setIsinUploadError(null);
        try {
            // 0. Get list of prerequisite data.
            const isins = await CaseIsinService.getInstance().getCaseIsinsByCaseId(caseId);

            // 1. Upload excel to Extractor service using new service
            const extractedJson = await uploadExcelToExtractor(file);

            // 2. Validate JSON (step 2)
            setIsinUploadStage('validating');
            const validationError = _validateExtractorResponse(extractedJson, isins);
            if (validationError) {
                setIsinUploadStage('warning');
                setIsinUploadError(validationError);
                return;
            }

            // 3. Prepare subscriptions to insert (empty for now)
            setIsinUploadStage('preparing');
            // Refetch latest trades before preparing subscriptions/cancellations
            const { currentTrades } = await fetchSubscriptionTrades(caseId);
            const { subscriptionsToInsert, cancellationsToInsert } = _preapreSubscriptionsToInsertOrCancel(extractedJson, currentTrades, isins, issueDate);

            // 4. Save subscriptions to DB (empty for now)
            setIsinUploadStage('saving');
            if(subscriptionsToInsert.length === 0 && cancellationsToInsert.length === 0) {
                setIsinUploadStage('norecords');
                return;
            }
            await TradeService.bulkUploadTrades(subscriptionsToInsert, cancellationsToInsert);

            setTimeout(async () => {
                // Refresh trades after successful upload
                await loadSubscriptionTrades();

                // 5. Done - show success
                setIsinUploadStage('done');
            }, 1000);
        } catch (err: any) {
            setIsinUploadStage('error');
            setIsinUploadError(err?.message || 'Upload failed');
        }
    }, [loadSubscriptionTrades]);
    
    return {
        currentTrades,
        soldTrades,
        loading,
        updating,
        error,
        updateTrade,
        handleBlur,
        // ISIN upload workflow
        uploadIsinsWorkflow,
        selectedFile,
        isinUploadStage,
        isinUploadError
    };
};
