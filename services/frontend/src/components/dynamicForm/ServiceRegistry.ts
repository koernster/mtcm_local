/**
 * Service Registry
 * 
 * Maps service names (from JSON config) to actual service instances.
 * Used by AutocompleteInput to dynamically call search methods.
 */

import CompanyService from '../../services/api/graphQL/company/service';
import CustodianService from '../../services/api/graphQL/custodians/service';

/**
 * Service instance type - any service with search methods
 */
export interface SearchableService {
    [methodName: string]: (query: string) => Promise<unknown[]>;
}

/**
 * Service factory function type
 */
type ServiceFactory = () => SearchableService;

/**
 * Service Registry
 * Maps service names to factory functions that return service instances.
 */
export const ServiceRegistry: Record<string, ServiceFactory> = {
    CompanyService: () => CompanyService.getInstance() as unknown as SearchableService,
    CustodianService: () => CustodianService.getInstance() as unknown as SearchableService,
};

/**
 * Get a service instance from the registry.
 * Returns undefined if service is not found.
 */
export const getService = (serviceName: string): SearchableService | undefined => {
    const factory = ServiceRegistry[serviceName];
    return factory ? factory() : undefined;
};

/**
 * Get a search function from a service.
 * Returns undefined if service or method is not found.
 */
export const getSearchFunction = (
    serviceName: string,
    methodName: string
): ((query: string) => Promise<unknown[]>) | undefined => {
    const service = getService(serviceName);
    if (!service) {
        console.warn(`ServiceRegistry: Service "${serviceName}" not found`);
        return undefined;
    }

    const method = service[methodName];
    if (typeof method !== 'function') {
        console.warn(`ServiceRegistry: Method "${methodName}" not found on service "${serviceName}"`);
        return undefined;
    }

    return method.bind(service);
};

export default ServiceRegistry;
