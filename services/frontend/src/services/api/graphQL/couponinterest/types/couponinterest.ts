export interface CouponInterest {
    id: string;
    isinid: string;
    interestrate: number;
    couponrate: number;
    eventdate: string | null;
    status: number | null;
    type: number | null;
}

export interface CouponInterestByIsinData {
    couponinterest: CouponInterest[];
}

export interface CouponInterestByIsinVariables {
    isinId: string;
}

export interface InsertCouponInterestData {
    insert_couponinterest_one: CouponInterest;
}

export interface InsertCouponInterestVariables {
    id: string;
    isinId: string;
    interestRate: number;
    couponRate?: number;
    eventDate?: string | null;
    status?: number;
    type?: string;
}

export interface UpdateCouponInterestData {
    update_couponinterest_by_pk: CouponInterest;
}

export interface UpdateCouponInterestVariables {
    id: string;
    interestRate?: number;
    couponRate?: number;
    eventDate?: string | null;
    status?: number;
    type?: string;
}

export interface DeleteCouponInterestData {
    delete_couponinterest_by_pk: {
        id: string;
    };
}

export interface DeleteCouponInterestVariables {
    id: string;
}
