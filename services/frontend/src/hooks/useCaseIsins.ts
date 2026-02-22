import { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';
import CaseIsinService from '../services/api/graphQL/caseisins/service';
import { IsinWithCompartment } from '../services/api/graphQL/caseisins/types/caseisins';
import { 
    fetchCaseIsins, 
    createCaseIsin, 
    updateCaseIsin, 
    deleteCaseIsin,
    ISINEntry 
} from '../store/slices/caseIsinsSlice';

const PAGE_SIZE = 20;

/**
 * Custom hook for ISIN database operations that updates Redux state.
 * 
 * This hook provides CRUD operations that:
 * - Perform database operations via services
 * - Update Redux state automatically
 * - Handle loading states via Redux
 * 
 * Additional Features:
 * - Pagination with load more functionality for ISINs with compartment names
 * - Debounced search capability for ISIN number or compartment name
 * - Loading states for initial load and load more
 * - Error handling
 * 
 * @param caseId - The case ID for operations
 * @returns {Object} Database operation functions and pagination/search functionality
 */
export const useCaseIsins = (caseId: string | null) => {
    const dispatch = useDispatch();
    const caseIsinService = CaseIsinService.getInstance();

    // Pagination and search state for ISINs with compartments
    const [isinsWithCompartments, setIsinsWithCompartments] = useState<IsinWithCompartment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    /**
     * Fetch ISINs for a case (triggers Redux action)
     */
    const fetchISINs = useCallback((caseId: string) => {
        return dispatch(fetchCaseIsins(caseId) as any);
    }, [dispatch]);

    /**
     * Create a new ISIN (triggers Redux action)
     */
    const createISIN = useCallback(async (
        entry: ISINEntry,
        couponTypeId: string
    ) => {
        if (!caseId) throw new Error('No case ID provided');
        
        return dispatch(createCaseIsin({
            caseid: caseId,
            entry,
            couponTypeId
        }) as any);
    }, [caseId, dispatch]);

    /**
     * Update an existing ISIN (triggers Redux action)
     */
    const updateISIN = useCallback(async (
        id: string, 
        field: string, 
        value: any,
        couponTypeId?: string
    ) => {
        return dispatch(updateCaseIsin({
            id,
            field,
            value,
            couponTypeId
        }) as any);
    }, [dispatch]);

    /**
     * Delete an ISIN (triggers Redux action)
     */
    const deleteISIN = useCallback(async (id: string) => {
        return dispatch(deleteCaseIsin(id) as any);
    }, [dispatch]);

    /**
     * Fetches ISINs with compartment names from the server based on search term and pagination
     * @param searchTerm - The term to search for (ISIN number or compartment name)
     * @param pageOffset - The offset for pagination
     * @param isLoadingMore - Whether this is a load more operation
     * @returns Promise<IsinWithCompartment[]> Array of ISINs with compartment names
     */
    const fetchIsinsWithCompartments = useCallback(async (searchTerm: string, pageOffset: number, isLoadingMore: boolean) => {
        try {
            let newIsins: IsinWithCompartment[];
            if (searchTerm) {
                newIsins = await caseIsinService.filterIsinsByNumberOrCompartment(searchTerm, pageOffset, PAGE_SIZE);
            } else {
                newIsins = await caseIsinService.getIsinsWithCompartments(pageOffset, PAGE_SIZE);
            }
            return newIsins;
        } catch (err) {
            throw err;
        }
    }, [caseIsinService]);

    /**
     * Loads ISINs with compartments with proper state management for loading, pagination, and search
     * 
     * State Management:
     * - Handles loading states (loading/loadingMore)
     * - Updates ISINs array (append for load more, replace for new search)
     * - Updates pagination offset
     * - Sets hasMore flag based on response size
     * 
     * @param isLoadingMore - Whether this is a load more operation
     */
    const loadIsinsWithCompartments = useCallback(async (isLoadingMore = false) => {
        try {
            if (isLoadingMore && loadingMore) return; // Prevent multiple loadMore calls
            
            if (isLoadingMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const pageOffset = isLoadingMore ? offset : 0;
            const newIsins = await fetchIsinsWithCompartments(debouncedSearch, pageOffset, isLoadingMore);
            
            setIsinsWithCompartments(prev => isLoadingMore ? [...prev, ...newIsins] : newIsins);
            setHasMore(newIsins.length === PAGE_SIZE);

            // Update offset only if we have new ISINs
            if (newIsins.length > 0) {
                setOffset(isLoadingMore ? offset + PAGE_SIZE : PAGE_SIZE);
            } else {
                setHasMore(false); // No more ISINs available
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load ISINs with compartments'));
            setHasMore(false); // Reset hasMore on error
        } finally {
            if (isLoadingMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    }, [debouncedSearch, offset, loadingMore, fetchIsinsWithCompartments]);

    // Reset and reload when search changes
    useEffect(() => {
        setOffset(0); // Reset offset when search changes
        setIsinsWithCompartments([]); // Clear existing ISINs
        setError(null); // Clear any previous errors
        setHasMore(true); // Reset hasMore flag
        loadIsinsWithCompartments(false); // Load first page
    }, [debouncedSearch]); // Only depend on debouncedSearch

    /**
     * Loads the next page of ISINs with compartments if available
     * This is typically called when the user scrolls or clicks a load more button
     */
    const loadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            loadIsinsWithCompartments(true);
        }
    }, [loading, loadingMore, hasMore, loadIsinsWithCompartments]);

    return {
        // Original CRUD operations
        fetchISINs,
        createISIN,
        updateISIN,
        deleteISIN,
        
        // New pagination and search functionality
        isinsWithCompartments,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        searchQuery,
        setSearchQuery
    };
};
