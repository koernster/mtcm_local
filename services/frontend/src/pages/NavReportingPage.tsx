import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import NavReportingList from '../components/nav/NavReportingList';
import VerticleCollapsContainer from '../components/common/VerticleCollapsContainer';
import ContentArea from '../components/common/ContentArea';
import { FaPrint } from 'react-icons/fa6';
import { StyledTable } from '../components/styled/CommonStyled';

// Type definition for NAV reporting data
interface NavReportingData {
    id: string;
    platform: string;
    compartment: string;
    name: string;
    isin: string;
    currency: string;
    quotation: string;
    navDate: string;
    nav: string;
    navFrequency: string;
}

// Static data for demonstration (to be replaced with API call later)
const getNavReportingData = (): NavReportingData[] => {
    return [
        {
            id: '1',
            platform: 'PRAETORIAN ASSETS S.a.r.l.',
            compartment: 'EMTN20/02',
            name: 'SREI',
            isin: 'CH0549200191',
            currency: 'CHF',
            quotation: '%',
            navDate: '11.12.2024',
            nav: '100.0000',
            navFrequency: 'Monthly'
        },
        {
            id: '2',
            platform: 'PRAETORIAN ASSETS S.a.r.l.',
            compartment: 'EMTN20/16',
            name: 'CLN Green Energy',
            isin: 'CH1108674065',
            currency: 'EUR',
            quotation: '%',
            navDate: '22.01.2024',
            nav: '60.0000',
            navFrequency: 'Monthly'
        },
        {
            id: '3',
            platform: 'PRAETORIAN ASSETS S.a.r.l.',
            compartment: 'EMTN20/19',
            name: 'SPX Capital',
            isin: 'CH0593676213',
            currency: 'EUR',
            quotation: '%',
            navDate: '16.12.2024',
            nav: '107.2800',
            navFrequency: 'Daily'
        },
        {
            id: '4',
            platform: 'PRAETORIAN ASSETS S.a.r.l.',
            compartment: 'EMTN20/20',
            name: 'CLN SMARTKAS',
            isin: 'CH0593676239',
            currency: 'USD',
            quotation: '%',
            navDate: '01.11.2023',
            nav: '100.0000',
            navFrequency: 'Monthly'
        },
        {
            id: '5',
            platform: 'PRAETORIAN ASSETS S.a.r.l.',
            compartment: 'EMTN20/20',
            name: 'CLN SMARTKAS',
            isin: 'CH1108674156',
            currency: 'EUR',
            quotation: '%',
            navDate: '01.11.2023',
            nav: '100.0000',
            navFrequency: 'Monthly'
        },
        {
            id: '6',
            platform: 'PRAETORIAN ASSETS S.a.r.l.',
            compartment: 'EMTN20/21',
            name: 'MedTech VC',
            isin: 'CH1108674149',
            currency: 'USD',
            quotation: '%',
            navDate: '11.12.2024',
            nav: '100.0000',
            navFrequency: 'Monthly'
        },
        {
            id: '7',
            platform: 'PRAETORIAN ASSETS S.a.r.l.',
            compartment: 'EMTN20/24',
            name: 'AMC ON LIMIU FUND',
            isin: 'CH1142529007',
            currency: 'CHF',
            quotation: 'Unit',
            navDate: '16.12.2024',
            nav: '9895.2126',
            navFrequency: 'Daily'
        },
        {
            id: '8',
            platform: 'PRAETORIAN ASSETS S.a.r.l.',
            compartment: 'EMTN20/27',
            name: 'CLO Tracker',
            isin: 'CH1108675328',
            currency: 'USD',
            quotation: '%',
            navDate: '03.12.2024',
            nav: '50.0000',
            navFrequency: 'Quarterly'
        },
        {
            id: '9',
            platform: 'ABS SECURITISATION SA',
            compartment: '2019/6618',
            name: 'Hyperion MT Aircraft',
            isin: 'CH1149139466',
            currency: 'EUR',
            quotation: '%',
            navDate: '22.07.2024',
            nav: '100.0000',
            navFrequency: 'Semi-Annually'
        },
        {
            id: '10',
            platform: 'ABS Securitisation SA',
            compartment: 'EMTN22-09',
            name: 'SquareFootage RiverCreek GP, New York, Notes USD',
            isin: 'CH1108675542',
            currency: 'USD',
            quotation: '%',
            navDate: '15.02.2024',
            nav: '100.0000',
            navFrequency: 'Yearly'
        }
    ];
};

// Function to generate the complete NAV reporting table
const generateNavReportingTable = (data: NavReportingData[]) => {
    return (
        <div style={{ overflowY: 'auto' }}>
            <StyledTable
                bordered
                hover
                responsive
                size="sm"
                style={{ marginBottom: 0 }}
            >
                <thead style={{ 
                    position: 'sticky', 
                    top: 0, 
                    zIndex: 10
                }}>
                    <tr>
                        <th>Platform</th>
                        <th>Compartment</th>
                        <th>Name</th>
                        <th>ISIN</th>
                        <th>Currency</th>
                        <th>Quotation</th>
                        <th>NAV date</th>
                        <th>NAV</th>
                        <th>NAV frequency</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.platform}</td>
                            <td>{item.compartment}</td>
                            <td>{item.name}</td>
                            <td>{item.isin}</td>
                            <td>{item.currency}</td>
                            <td>{item.quotation}</td>
                            <td>{item.navDate}</td>
                            <td>{item.nav}</td>
                            <td>{item.navFrequency}</td>
                        </tr>
                    ))}
                </tbody>
            </StyledTable>
        </div>
    );
};

const NavReportingPage: React.FC = () => {
    // Get the data (can be replaced with API call later)
    const navData = getNavReportingData();
    return (<Container fluid>
          <Row className="d-flex">
            <VerticleCollapsContainer
                sm={3} 
                md={3} 
                xs={3} 
                titleText="Net Asset Value (NAV)"
            >
                <NavReportingList />
            </VerticleCollapsContainer>
             <ContentArea 
                    sm={8}
                    md={8}
                    header={"Net Asset Value (NAV) - 2024-01-15"}
                    subHeader={"Mixed performance: SPX Capital outperforming at 107.28%, CLN Green Energy underperforming at 60%, most instruments stable."}
                    toolButtons={(<>
                            <Button variant="outline-success" size="sm">
                                <FaPrint /> Print Report
                            </Button>
                        </>)}
                    body={generateNavReportingTable(navData)}
                />
        </Row>
    </Container>);
}

export default NavReportingPage;