import { gql } from '@apollo/client';

export const BATCH_INSERT_EVENT_TRANSACTION = gql`
    mutation BatchInsertEventTransaction(
        $predefinedEventDates: [predefinedeventdates_insert_input!]!,
        $eventWithTypes: [eventwithtypes_insert_input!]!
    ) {
        insert_predefinedeventdates(objects: $predefinedEventDates) {
            returning {
                id
                caseid
                cutoffdate
            }
        }
        insert_eventwithtypes(objects: $eventWithTypes) {
            returning {
                id
                eventid
                typeid
            }
        }
    }
`;
