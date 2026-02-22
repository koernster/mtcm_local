export interface PredefinedEventDate {
    id: string;
    caseid: string;
    cutoffdate: string;
}

export interface EventWithType {
    id: string;
    eventid: string;
    typeid: string;
}

export interface EventsData {
    predefinedeventdates: PredefinedEventDate[];
    eventwithtypes: EventWithType[];
}

export interface EventsVariables {
    caseid?: string;
}

export interface CreateEventInput {
    predefinedEventDate: {
        id: string;
        caseid: string;
        cutoffdate: string;
    };
    eventWithType: {
        id: string;
        eventid: string;
        typeid: string;
    };
}

export interface CreateEventResponse {
    insert_predefinedeventdates_one: PredefinedEventDate;
    insert_eventwithtypes_one: EventWithType;
}

export interface BatchInsertEventInput {
    predefinedEventDates: {
        id: string;
        caseid: string;
        cutoffdate: string;
    }[];
    eventWithTypes: {
        id: string;
        eventid: string;
        typeid: string;
    }[];
}

export interface BatchInsertEventResponse {
    insert_predefinedeventdates: {
        returning: PredefinedEventDate[];
    };
    insert_eventwithtypes: {
        returning: EventWithType[];
    };
}
