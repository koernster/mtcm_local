import { useState, useEffect, useCallback } from 'react';
import CaseService from '../services/api/graphQL/cases/service';
import { CaseByCompartmentStatus } from '../services/api/graphQL/cases/types/case';

interface UseCasesByCompartmentStatusResult {
    cases: CaseByCompartmentStatus[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    totalCount: number;
    statusLookup: Record<number, string>;
    loadMore: () => void;
    refresh: () => void;
}

export const useCasesByCompartmentStatus = (statusId: number): UseCasesByCompartmentStatusResult => {
    const [cases, setCases] = useState<CaseByCompartmentStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [statusLookup, setStatusLookup] = useState<Record<number, string>>({});
    const [offset, setOffset] = useState(0);

    const caseService = CaseService.getInstance();
    const LIMIT = 20;

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const result = await caseService.getCasesByCompartmentStatus(
                statusId,
                offset,
                LIMIT
            );

            setCases(prevCases => [...prevCases, ...result.cases]);
            setOffset(prevOffset => prevOffset + LIMIT);
            setTotalCount(result.totalCount);
            setStatusLookup(result.statusLookup);
            setHasMore(result.cases.length === LIMIT && (offset + LIMIT) < result.totalCount);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error loading more cases:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [statusId, offset, hasMore, loadingMore, caseService]);

    const refresh = useCallback(async () => {
        setOffset(0);
        setCases([]);
        setTotalCount(0);
        setStatusLookup({});
        setHasMore(true);
        setError(null);
        
        try {
            setLoading(true);
            const result = await caseService.getCasesByCompartmentStatus(
                statusId,
                0,
                LIMIT
            );

            setCases(result.cases);
            setOffset(LIMIT);
            setTotalCount(result.totalCount);
            setStatusLookup(result.statusLookup);
            setHasMore(result.cases.length === LIMIT && LIMIT < result.totalCount);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error loading cases by compartment status:', err);
        } finally {
            setLoading(false);
        }
    }, [statusId, caseService]);

    useEffect(() => {
        if (statusId > 0) {
            refresh();
        }
    }, [statusId, refresh]);

    return {
        cases,
        loading,
        loadingMore,
        error,
        hasMore,
        totalCount,
        statusLookup,
        loadMore,
        refresh
    };
};
