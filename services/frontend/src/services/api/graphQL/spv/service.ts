import client from '../client';
import { GET_SPVS } from './queries/getSpvs';
import { INSERT_SPV } from './mutations/createSpv';
import {
    UPDATE_SPV,
    UPSERT_ADDRESS,
    UPSERT_PAYMENT_DETAIL,
    UPDATE_SPV_LINK_ADDRESS,
    UPDATE_SPV_LINK_PAYMENT
} from './mutations/updateSpv';
import { Spv } from './types/types';
import { CacheManager } from '../../../../lib/cacheManager';
import { generateUUID } from '../../../../lib/generateUUID';

class SpvService {
    private static instance: SpvService;
    private spvs: Spv[] | null = null;
    private readonly CACHE_KEY = 'spvs';

    private constructor() { }

    public static getInstance(): SpvService {
        if (!SpvService.instance) {
            SpvService.instance = new SpvService();
        }
        return SpvService.instance;
    }

    public async loadSpvs() {
        // Try to get from memory first
        if (this.spvs) {
            return this.spvs;
        }

        // Try to get from cache
        const cachedData = CacheManager.getCache<Spv[]>(this.CACHE_KEY);
        if (cachedData) {
            this.spvs = cachedData;
            return this.spvs;
        }

        // If not in cache or expired, fetch from API
        const { data } = await client.query({ query: GET_SPVS });
        this.spvs = data.spvs;

        // Save to cache
        CacheManager.setCache(this.CACHE_KEY, this.spvs);

        return this.spvs;
    }

    public async fetchSpvsFromServer(): Promise<Spv[]> {
        // Force fetch from server, bypassing cache
        const { data } = await client.query({
            query: GET_SPVS,
            fetchPolicy: 'network-only'
        });
        this.spvs = data.spvs;
        CacheManager.setCache(this.CACHE_KEY, this.spvs);
        return this.spvs || [];
    }

    public getSpvs() {
        return this.spvs;
    }

    public async createSpv(spvtitle: string, spvdescription?: string, logo?: string): Promise<Spv> {
        const id = generateUUID();
        const addressId = generateUUID();
        const paymentDetailId = generateUUID();

        const { data } = await client.mutate<{ insert_spvs_one: Spv }>({
            mutation: INSERT_SPV,
            variables: {
                id,
                spvtitle,
                spvdescription: spvdescription || '',
                logo: logo || null,
                addressId,
                paymentDetailId
            }
        });

        // Clear cache to force refresh
        this.clearCache();

        return data!.insert_spvs_one;
    }

    public async updateSpv(id: string, updates: Partial<Spv>): Promise<Spv> {
        const currentSpv = this.spvs?.find(s => s.id === id);

        // Extract address data
        const address = updates.address || {};
        const { __typename: addrTypename, ...cleanAddress } = address as any;

        // Extract payment data
        const paymentdetail = updates.paymentdetail || {};
        const { __typename: payTypename, ...cleanPayment } = paymentdetail as any;

        // Check if we have address/payment data to update
        const hasAddressData = Object.keys(cleanAddress).some(key => key !== 'id' && cleanAddress[key]);
        const hasPaymentData = Object.keys(cleanPayment).some(key => key !== 'id' && cleanPayment[key]);

        // Get existing IDs or generate new ones
        let addressId = currentSpv?.address?.id || (address as any)?.id;
        let paymentDetailId = currentSpv?.paymentdetail?.id || (paymentdetail as any)?.id;

        // Handle address upsert if we have address data
        if (hasAddressData) {
            if (!addressId) {
                // No existing address - create new one and link it
                addressId = generateUUID();
            }

            // Upsert address (insert or update)
            await client.mutate({
                mutation: UPSERT_ADDRESS,
                variables: {
                    id: addressId,
                    addressline1: cleanAddress.addressline1 || '',
                    addressline2: cleanAddress.addressline2 || '',
                    city: cleanAddress.city || '',
                    country: cleanAddress.country || '',
                    postalcode: cleanAddress.postalcode || '',
                    email: cleanAddress.email || '',
                    phone: cleanAddress.phone || '',
                    website: cleanAddress.website || ''
                }
            });

            // Link address to SPV if it was newly created
            if (!currentSpv?.address?.id) {
                await client.mutate({
                    mutation: UPDATE_SPV_LINK_ADDRESS,
                    variables: { id, addressId }
                });
            }
        }

        // Handle payment detail upsert if we have payment data
        if (hasPaymentData) {
            if (!paymentDetailId) {
                // No existing payment detail - create new one and link it
                paymentDetailId = generateUUID();
            }

            // Upsert payment detail (insert or update)
            await client.mutate({
                mutation: UPSERT_PAYMENT_DETAIL,
                variables: {
                    id: paymentDetailId,
                    accountname: cleanPayment.accountname || '',
                    beneficiarybank: cleanPayment.beneficiarybank || '',
                    correspondent_aba: cleanPayment.correspondent_aba || '',
                    correspondent_swift: cleanPayment.correspondent_swift || '',
                    correspondentbank: cleanPayment.correspondentbank || '',
                    iban: cleanPayment.iban || ''
                }
            });

            // Link payment detail to SPV if it was newly created
            if (!currentSpv?.paymentdetail?.id) {
                await client.mutate({
                    mutation: UPDATE_SPV_LINK_PAYMENT,
                    variables: { id, paymentDetailId }
                });
            }
        }

        // Update the SPV itself (title, description, and logo)
        const { data } = await client.mutate<{ update_spvs_by_pk: Spv }>({
            mutation: UPDATE_SPV,
            variables: {
                id,
                spvtitle: updates.spvtitle,
                spvdescription: updates.spvdescription,
                logo: updates.logo || null
            }
        });

        this.clearCache();
        return data!.update_spvs_by_pk;
    }

    public clearCache() {
        this.spvs = null;
        CacheManager.clearCache(this.CACHE_KEY);
    }
}

export default SpvService;
