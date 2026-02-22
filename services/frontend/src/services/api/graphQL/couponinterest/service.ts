import client from '../client';
import { GET_COUPON_INTEREST_BY_ISIN } from './queries/getCouponInterestByIsin';
import { INSERT_COUPON_INTEREST } from './mutations/insertCouponInterest';
import { UPDATE_COUPON_INTEREST } from './mutations/updateCouponInterest';
import { DELETE_COUPON_INTEREST } from './mutations/deleteCouponInterest';
import { UPDATE_ONLY_INTEREST_RATE } from './mutations/updateOnlyInterestRate';
import { UPDATE_ONLY_COUPON_RATE } from './mutations/updateOnlyCouponRate';
import {
    CouponInterest,
    CouponInterestByIsinData,
    CouponInterestByIsinVariables,
    InsertCouponInterestData,
    InsertCouponInterestVariables,
    UpdateCouponInterestData,
    UpdateCouponInterestVariables,
    DeleteCouponInterestData,
    DeleteCouponInterestVariables
} from './types/couponinterest';

class CouponInterestService {
    private static instance: CouponInterestService;

    private constructor() {}

    public static getInstance(): CouponInterestService {
        if (!CouponInterestService.instance) {
            CouponInterestService.instance = new CouponInterestService();
        }
        return CouponInterestService.instance;
    }

    public async getCouponInterestByIsinId(isinId: string): Promise<CouponInterest[]> {
        const { data } = await client.query<CouponInterestByIsinData, CouponInterestByIsinVariables>({
            query: GET_COUPON_INTEREST_BY_ISIN,
            variables: { isinId },
            fetchPolicy: 'network-only'
        });
        return data.couponinterest;
    }

    public async createCouponInterest(
        id: string,
        isinId: string,
        interestRate: number,
        couponRate?: number,
        eventDate?: string | null,
        status?: number,
        type?: string
    ): Promise<CouponInterest> {
        const { data } = await client.mutate<InsertCouponInterestData, InsertCouponInterestVariables>({
            mutation: INSERT_COUPON_INTEREST,
            variables: {
                id,
                isinId,
                interestRate,
                couponRate,
                eventDate,
                status,
                type
            }
        });
        return data!.insert_couponinterest_one;
    }

    public async updateCouponInterest(
        id: string,
        updates: {
            interestRate?: number;
            couponRate?: number;
            eventDate?: string | null;
            status?: number;
            type?: string;
        }
    ): Promise<CouponInterest> {
        const { data } = await client.mutate<UpdateCouponInterestData, UpdateCouponInterestVariables>({
            mutation: UPDATE_COUPON_INTEREST,
            variables: {
                id,
                ...updates
            }
        });
        return data!.update_couponinterest_by_pk;
    }

    public async updateOnlyInterestRate(
        id: string,
        interestRate: number
    ): Promise<CouponInterest> {
        const { data } = await client.mutate<UpdateCouponInterestData, UpdateCouponInterestVariables>({
            mutation: UPDATE_ONLY_INTEREST_RATE,
            variables: {
                id,
                interestRate
            }
        });
        return data!.update_couponinterest_by_pk;
    }

    public async updateOnlyCouponRate(
        id: string,
        couponRate: number
    ): Promise<CouponInterest> {
        const { data } = await client.mutate<UpdateCouponInterestData, UpdateCouponInterestVariables>({
            mutation: UPDATE_ONLY_COUPON_RATE,
            variables: {
                id,
                couponRate
            }
        });
        return data!.update_couponinterest_by_pk;
    }
}

export default CouponInterestService;
