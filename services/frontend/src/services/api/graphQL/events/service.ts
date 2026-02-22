import client from '../client';
import { GET_EVENTS } from './queries/getEvents';
import { INSERT_EVENT_TRANSACTION } from './mutations/insertEventTransaction';
import { BATCH_INSERT_EVENT_TRANSACTION } from './mutations/batchInsertEventTransaction';
import { 
    EventsData, 
    EventsVariables,
    CreateEventInput,
    CreateEventResponse,
    BatchInsertEventInput,
    BatchInsertEventResponse,
    PredefinedEventDate,
    EventWithType
} from './types/events';

class EventService {
    private static instance: EventService;

    private constructor() {}

    public static getInstance(): EventService {
        if (!EventService.instance) {
            EventService.instance = new EventService();
        }
        return EventService.instance;
    }

    public async getEvents(caseid?: string): Promise<{ predefinedeventdates: PredefinedEventDate[], eventwithtypes: EventWithType[] }> {
        const { data } = await client.query<EventsData, EventsVariables>({
            query: GET_EVENTS,
            variables: caseid ? { caseid } : {},
            fetchPolicy: 'network-only' // This ensures we always get fresh data
        });
        return {
            predefinedeventdates: data.predefinedeventdates,
            eventwithtypes: data.eventwithtypes
        };
    }

    public async createEventTransaction(input: CreateEventInput): Promise<CreateEventResponse> {
        const { data } = await client.mutate<CreateEventResponse>({
            mutation: INSERT_EVENT_TRANSACTION,
            variables: {
                predefinedEventId: input.predefinedEventDate.id,
                caseid: input.predefinedEventDate.caseid,
                cutoffdate: input.predefinedEventDate.cutoffdate,
                eventWithTypeId: input.eventWithType.id,
                eventid: input.eventWithType.eventid,
                typeid: input.eventWithType.typeid
            }
        });
        return data!;
    }

    public async createEventTransactionsBatch(input: BatchInsertEventInput): Promise<BatchInsertEventResponse> {
        const { data } = await client.mutate<BatchInsertEventResponse>({
            mutation: BATCH_INSERT_EVENT_TRANSACTION,
            variables: {
                predefinedEventDates: input.predefinedEventDates,
                eventWithTypes: input.eventWithTypes
            }
        });
        return data!;
    }
}

export default EventService;
