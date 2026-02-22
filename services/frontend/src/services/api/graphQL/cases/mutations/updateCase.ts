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
      spvid
      spv {
        id
        spvdescription
        spvtitle
        address {
          addressline1
          addressline2
          city
          country
          postalcode
          email
          phone
          website
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
      broker
      trustee
      coponpaymentdate
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
    }
  }
`;
