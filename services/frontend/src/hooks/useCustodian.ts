import { useState } from 'react';
import CustodianService from '../services/api/graphQL/custodians/service';
import { Custodian } from '../services/api/graphQL/custodians/types/custodian';

export const useCustodian = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const custodianService = CustodianService.getInstance();

    const saveCustodianAndUpdateCase = async (
        custodianName: string,
        caseId: string,
        updateCase: (data: any) => Promise<void>
    ): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            // First search if the custodian already exists
            const searchResults = await custodianService.searchCustodians(custodianName);
            let custodian: Custodian;

            if (searchResults.length > 0 && searchResults[0].custodian.toLowerCase() === custodianName.toLowerCase()) {
                // Use existing custodian
                custodian = searchResults[0];
            } else {
                // Create new custodian
                custodian = await custodianService.createCustodian(custodianName);
            }

            // Update the case with the custodian
            await updateCase({
                custodian: custodian.id,
                custodianByCustodian: {
                    id: custodian.id,
                    custodianname: custodian.custodian
                }
            });
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        saveCustodianAndUpdateCase,
        loading,
        error
    };
};
