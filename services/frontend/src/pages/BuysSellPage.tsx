import React from 'react';
import { Container, Row } from 'react-bootstrap';
import ISINListWithFilter from '../components/businesscommon/ISINListWithFilter';
import BuySellComponent from '../components/buysell/BuySellComponent';
import VerticleCollapsContainer from '../components/common/VerticleCollapsContainer';
import ContentArea from '../components/common/ContentArea';
import { useParams } from 'react-router-dom';

const BuySellPage: React.FC = () => {
    const { isinId } = useParams<{ isinId: string }>();

    return (
        <Container fluid>
            <Row>
                 <VerticleCollapsContainer sm={3} md={3} xs={3} titleText="Buy/Sell ISINs">
                    <ISINListWithFilter pageName='buy-sell' />
                </VerticleCollapsContainer>
                <ContentArea sm={9}
                    header='Buy/Sell Transactions'
                    subHeader='Manage buy and sell transactions for securities.'
                    body={
                        isinId && <BuySellComponent isinId={isinId} />
                    }
                />
            </Row>
        </Container>
    );
};

export default BuySellPage;