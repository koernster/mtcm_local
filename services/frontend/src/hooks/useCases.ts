import { useState, useEffect, useCallback } from 'react';
import CaseService from '../services/api/graphQL/cases/service';
import { Case } from '../services/api/graphQL/cases/types/case';
import { useDebounce } from 'use-debounce';

const PAGE_SIZE = 20;

/**
 * Custom hook for managing case data with pagination and search functionality.
 * 
 * Features:
 * - Pagination with load more functionality
 * - Debounced search capability
 * - Loading states for initial load and load more
 * - Error handling
 * 
 * @returns {Object} An object containing:
 *   - cases: Array of Case objects currently loaded
 *   - loading: Boolean indicating if initial load is in progress
 *   - loadingMore: Boolean indicating if load more is in progress
 *   - error: Error object if any error occurred
 *   - hasMore: Boolean indicating if more cases are available
 *   - loadMore: Function to load next page of cases
 *   - searchQuery: Current search query string
 *   - setSearchQuery: Function to update search query
 */
export const useCases = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const caseService = CaseService.getInstance();

    /**
     * Fetches cases from the server based on search term and pagination
     * @param searchTerm - The term to search for
     * @param pageOffset - The offset for pagination
     * @param isLoadingMore - Whether this is a load more operation
     * @returns Promise<Case[]> Array of cases
     */
    const fetchCases = useCallback(async (searchTerm: string, pageOffset: number, isLoadingMore: boolean) => {
        try {
            let newCases: Case[];
            if (searchTerm) {
                newCases = await caseService.searchCases(searchTerm, pageOffset, PAGE_SIZE);
            } else {
                newCases = await caseService.loadCases(pageOffset, PAGE_SIZE);
            }
            return newCases;
        } catch (err) {
            throw err;
        }
    }, []);

    /**
     * Loads cases with proper state management for loading, pagination, and search
     * 
     * State Management:
     * - Handles loading states (loading/loadingMore)
     * - Updates cases array (append for load more, replace for new search)
     * - Updates pagination offset
     * - Sets hasMore flag based on response size
     * 
     * @param isLoadingMore - Whether this is a load more operation
     */
    const loadCases = useCallback(async (isLoadingMore = false) => {
        try {
            if (isLoadingMore && loadingMore) return; // Prevent multiple loadMore calls
            
            if (isLoadingMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const pageOffset = isLoadingMore ? offset : 0;
            const newCases = await fetchCases(debouncedSearch, pageOffset, isLoadingMore);
            
            setCases(prev => isLoadingMore ? [...prev, ...newCases] : newCases);
            setHasMore(newCases.length === PAGE_SIZE);

            // Update offset only if we have new cases
            if (newCases.length > 0) {
                setOffset(isLoadingMore ? offset + PAGE_SIZE : PAGE_SIZE);
            } else {
                setHasMore(false); // No more cases available
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load cases'));
            setHasMore(false); // Reset hasMore on error
        } finally {
            if (isLoadingMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    }, [debouncedSearch, offset, loadingMore, fetchCases]);

    // Reset and reload when search changes
    useEffect(() => {
        setOffset(0); // Reset offset when search changes
        setCases([]); // Clear existing cases
        setError(null); // Clear any previous errors
        setHasMore(true); // Reset hasMore flag
        loadCases(false); // Load first page
    }, [debouncedSearch]); // Only depend on search changes to prevent unnecessary reloads

    /**
     * Loads the next page of cases if available
     * This is typically called when the user scrolls or clicks a load more button
     */
    const loadMore = useCallback(() => {
        if (!loading && !loadingMore && hasMore) {
            loadCases(true);
        }
    }, [loading, loadingMore, hasMore, loadCases]);

    return { 
        cases, 
        loading, 
        loadingMore, 
        error, 
        hasMore, 
        loadMore,
        searchQuery,
        setSearchQuery
    };
};
