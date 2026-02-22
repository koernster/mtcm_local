import { gql } from '@apollo/client';

export const UPDATE_CASE = gql`
  mutation UpdateCase($id: uuid!, $data: cases_set_input!) {
    update_cases_by_pk(
      pk_columns: { id: $id }
      _set: $data
    ) {
      id
      compartmentname
      company {
        id
        companyname
        hbid
        clienttype
        addressByAddressid {
          addressline1
          addressline2
          city
          state_or_province
          country
          postalcode
          phone
          email
          website
        }
      }
      companyByUnderlyingcompanyid {
        id
        companyname
        isunderlyingclient
        addressByAddressid {
          addressline1
          addressline2
          city
          state_or_province
          country
          postalcode
          phone
          email
          website
        }
     }
      spvid
      spv {
        id
        companyid
        spvdescription
        spvtitle
        logo
        address {
          id
          addressline1
          addressline2
          city
          country
          postalcode
          email
          phone
          website
        }
        paymentdetail {
          id
          iban
          bankname
          address
          beneficiary
          bicintermediary
          swift
        }
      }
      investmenttype {
        id
        typename
      }
      producttype {
        id
        typename
      }
      coponfrequency {
        id
        frequency
      }
      copontype {
        id
        typename
      }
      coponpaymentscheduleid
      coponpaymentscheduletype {
        id
        typename
      }
      agenttypeid
      payagenttype {
        id
        typename
      }
      maturitydate
      issuedate
      issueprice
      mintradeamt
      mintradelot
      subscriptiondate
      earlyredemptiondate
      custodian
      custodianByCustodian {
        id
        custodian
      }
      productsetupstatusid
      compartmentstatusid
      casefee {
        id
        caseid
        setupfee
        setupfeetype
        adminfee
        adminfeetype
        managementfee
        managementfeetype
        salesfee
        salesfeetype
        performancefee
        performancefeetype
        otherfees
        otherfeestype
      }
      casecost {
        id
        caseid
        operationalcosts
        operationalcosttype
        runningcosts
        runningcosttype
        payingagentcosts
        payingagentcosttype
        auditcosts
        auditcosttype
        legalcosts
        legalcosttype
      }
      case_assetbaskets(order_by: {createdat: asc}) {
        id
        assetname
        assetvalue
        valuetype
      }
      casesubscriptiondata {
        id
        caseid
        distributionpaidbyinvs
        salesfeepaidbyinves
        salesnotpaidissuedate
        salesnotpaidmaturitydate
      }
      broker
      trustee
      coponpaymentdate
    }
  }
`;

