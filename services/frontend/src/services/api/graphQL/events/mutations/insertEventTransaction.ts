import { gql } from '@apollo/client';

export const INSERT_EVENT_TRANSACTION = gql`
    mutation InsertEventTransaction(
        $predefinedEventId: uuid!,
        $caseid: uuid!,
        $cutoffdate: timestamptz!,
        $eventWithTypeId: uuid!,
        $eventid: uuid!,
        $typeid: uuid!
    ) {
        insert_predefinedeventdates_one(object: {
            id: $predefinedEventId,
            caseid: $caseid,
            cutoffdate: $cutoffdate
        }) {
            id
            caseid
            cutoffdate
        }
        insert_eventwithtypes_one(object: {
            id: $eventWithTypeId,
            eventid: $eventid,
            typeid: $typeid
        }) {
            id
            eventid
            typeid
        }
    }
`;
