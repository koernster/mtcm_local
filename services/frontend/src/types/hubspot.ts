export interface HubSpotContactSearchResponse {
    total: number;
    results: HubSpotContact[];
}

export interface HubSpotContact {
    id: string;
    properties: {
        createdate: string;
        email: string;
        firstname: string;
        hs_object_id: string;
        lastmodifieddate: string;
        lastname: string;
    };
    createdAt: string;
    updatedAt: string;
    archived: boolean;
}
