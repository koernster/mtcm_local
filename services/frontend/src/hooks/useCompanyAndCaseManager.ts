import { Company, CompanyService } from '../services/api/graphQL/company';
import { CaseService } from '../services/api/graphQL/cases';
import { HubSpotContact } from '../services/api/hubspot/types';

import { useDispatch } from 'react-redux';
import { setCaseData } from '../store/slices/caseSetupSlice';

export const useCompanyAndCaseManager = () => {
    const dispatch = useDispatch();

    const saveClientAndUpdateCase = async (contact: HubSpotContact, caseId: string): Promise<Company> => {
        try {
            const companyService = CompanyService.getInstance();
            const caseService = CaseService.getInstance();

            // Try to get company by HubSpot ID first
            const company = await companyService.getCompanyByHBID(contact.id);
            
            // If company doesn't exist, create it
            const updatedCompany = company || await companyService.createCompany(
                contact.id,
                `${contact.properties.firstname} ${contact.properties.lastname}`
            );
            
            // Update case with company ID
            if (caseId) {
                // Update the case and get the full updated case data
                const updatedCase = await caseService.updateCaseCompany(caseId, updatedCompany.id);
                
                // Update Redux store with the full updated case data
                dispatch(setCaseData(updatedCase));
            }
            
            return updatedCompany;
        } catch (error) {
            console.error('Error handling client selection:', error);
            throw error;
        }
    };

    return {
        saveClientAndUpdateCase
    };
};
