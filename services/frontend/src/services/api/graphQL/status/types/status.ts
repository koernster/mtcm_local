export interface Status {
    id: string;
    status: string;
    description: string;
    statustype: number;
}

export enum StatusType {
    ProductSetupStatus = 0,
    CompartmentStatus = 1
}
