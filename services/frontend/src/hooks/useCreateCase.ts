import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CaseService from '../services/api/graphQL/cases/service';
import { generateUUID } from '../lib/generateUUID';

export const useCreateCase = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const createCase = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);            // Generate a new UUID for the case
            const id = generateUUID();
            
            // Create a new case with default compartment name
            // New cases are created with compartmentstatusid = 7 (product setup)
            // We'll let the user change it in Product Setup
            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, '0');
            const tempName = `Compartment-${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
            const newCase = await CaseService.getInstance().createCase(id, tempName);

            // Navigate to the new case's product setup
            navigate(`/case-management/${newCase.id}/product-setup`);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create case'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    return { createCase, loading, error };
};
