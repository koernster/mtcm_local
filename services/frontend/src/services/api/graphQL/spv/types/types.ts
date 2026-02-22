export interface Spv {
    id: string;
    companyid?: string;
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
        bankname: string;
        address: string;
        beneficiary: string;
        bicintermediary: string;
        swift: string;
    }
}
