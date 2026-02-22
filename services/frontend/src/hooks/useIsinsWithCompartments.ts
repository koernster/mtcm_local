import { useState, useEffect, useCallback } from 'react';
import CaseIsinService from '../services/api/graphQL/caseisins/service';
import { IsinWithCompartment } from '../services/api/graphQL/caseisins/types/caseisins';
import { useDebounce } from 'use-debounce';

const PAGE_SIZE = 20;

/**
 * Custom hook for managing ISIN data with compartment names, pagination and search functionality.
 * 
 * Features:
 * - Pagination with load more functionality
 * - Debounced search capability for ISIN number or compartment name
 * - Loading states for initial load and load more
 * - Error handling
 * 
 * @returns {Object} An object containing:
 *   - isins: Array of IsinWithCompartment objects currently loaded
 *   - loading: Boolean indicating if initial load is in progress
 *   - loadingMore: Boolean indicating if load more is in progress
 *   - error: Error object if any error occurred
 *   - hasMore: Boolean indicating if more ISINs are available
 *   - loadMore: Function to load next page of ISINs
 *   - searchQuery: Current search query string
 *   - setSearchQuery: Function to update search query
 */
export const useIsinsWithCompartments = () => {
    const [isins, setIsins] = useState<IsinWithCompartment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const caseIsinService = CaseIsinService.getInstance();

    /**
     * Fetches ISINs from the server based on search term and pagination
     * @param searchTerm - The term to search for (ISIN number or compartment name)
     * @param pageOffset - The offset for pagination
     * @param isLoadingMore - Whether this is a load more operation
     * @returns Promise<IsinWithCompartment[]> Array of ISINs with compartment names
     */
    const fetchIsins = useCallback(async (searchTerm: string, pageOffset: number, isLoadingMore: boolean) => {
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
     * Loads ISINs with proper state management for loading, pagination, and search
     * 
     * State Management:
     * - Handles loading states (loading/loadingMore)
     * - Updates ISINs array (append for load more, replace for new search)
     * - Updates pagination offset
     * - Sets hasMore flag based on response size
     * 
     * @param isLoadingMore - Whether this is a load more operation
     */
    const loadIsins = useCallback(async (isLoadingMore = false) => {
        try {
            if (isLoadingMore && loadingMore) return; // Prevent multiple loadMore calls
            
            if (isLoadingMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const pageOffset = isLoadingMore ? offset : 0;
            const newIsins = await fetchIsins(debouncedSearch, pageOffset, isLoadingMore);
            
            setIsins(prev => isLoadingMore ? [...prev, ...newIsins] : newIsins);
            setHasMore(newIsins.length === PAGE_SIZE);

            // Update offset only if we have new ISINs
            if (newIsins.length > 0) {
                setOffset(isLoadingMore ? offset + PAGE_SIZE : PAGE_SIZE);
            } else {
                setHasMore(false); // No more ISINs available
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load ISINs'));
            setHasMore(false); // Reset hasMore on error
        } finally {
            if (isLoadingMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    }, [debouncedSearch, offset, loadingMore, fetchIsins]);

    // Reset and reload when search changes
    useEffect(() => {
        setOffset(0); // Reset offset when search changes
        setIsins([]); // Clear existing ISINs
        setError(null); // Clear any previous errors
        setHasMore(true); // Reset hasMore flag
        loadIsins(false); // Load first page
    }, [debouncedSearch]); // Only depend on search changes to prevent unnecessary reloads

    /**
     * Loads the next page of ISINs if available
     * This is typically called when the user scrolls or clicks a load more button
     */
    const loadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            loadIsins(true);
        }
    }, [loading, loadingMore, hasMore, loadIsins]);

    return { 
        isins, 
        loading, 
        loadingMore, 
        error, 
        hasMore, 
        loadMore,
        searchQuery,
        setSearchQuery
    };
};