export interface Spv {
    id: string;
    spvdescription: string;
    spvtitle: string;
    logo?: string;
    address: {
        id?: string;
        addressline1: string;
        addressline2: string;
        city: string;
        country: string;
        postalcode: string;
        email: string;
        phone: string;
        website: string;
    }
    paymentdetail?: {
        id?: string;
        iban: string;
        correspondent_aba: string;
        correspondentbank: string;
        correspondent_swift: string;
        beneficiarybank: string;
        accountname: string;
    }
}
