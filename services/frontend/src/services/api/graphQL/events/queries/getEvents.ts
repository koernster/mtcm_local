import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
    query GetEvents($caseid: uuid) {
        predefinedeventdates(where: { caseid: { _eq: $caseid } }) {
            id
            caseid
            cutoffdate
        }
        eventwithtypes {
            id
            eventid
            typeid
        }
    }
`;
