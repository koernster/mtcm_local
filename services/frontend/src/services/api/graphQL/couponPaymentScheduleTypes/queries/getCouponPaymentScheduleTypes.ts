import { gql } from '@apollo/client';

export const GET_COUPON_PAYMENT_SCHEDULE_TYPES = gql`
    query GetCoponPaymentScheduleTypes {
        coponpaymentscheduletypes {
            id
            typename
        }
    }
`;
