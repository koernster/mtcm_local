import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import ProtectedRoute from './components/ProtectedRoute';
import MaintenanceGuard from './components/MaintenanceGuard';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import StandaloneMaintenancePage from './pages/StandaloneMaintenancePage';
import NavBar from './components/NavBar';
import VerticleNavBar from './components/VerticleNavBar';
import { Container, Row } from 'react-bootstrap';
import { VerticalBar } from './components/styled/CommonStyled';
import styled from 'styled-components';
import CaseManagementPage from './pages/CaseManagementPage';
import NavReportingPage from './pages/NavReportingPage';
import { ApolloProvider } from '@apollo/client';
import client from './services/api/graphQL/client';
import BuySellPage from './pages/BuysSellPage';
import CouponPage from './pages/CouponPage';
import { useAuth } from './context/AuthContext';
//import BackgroundNotificationProcessor from './notications/BackgroundNotificationProcessor';
//import { useEffect } from 'react';

const StyledAppContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  min-height: 100vh;
`;

function App() {
  const { keycloak } = useAuth();

  // useEffect(() => {
  //   if (!keycloak?.tokenParsed) return;
  //   const username = keycloak.tokenParsed.name?.replace(/\s+/g, '') || '';
  //   const groups = keycloak.tokenParsed.groups || [];
  //   const processor = new BackgroundNotificationProcessor();
  //   processor.start(username, groups);
  //   return () => processor.stop();
  // }, [keycloak]);

  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          {/* Maintenance page (standalone) */}
          <Route path="/maintenance" element={<StandaloneMaintenancePage />} />

          {/* Main app with layout - wrapped with MaintenanceGuard */}
          <Route path="/*" element={
            <MaintenanceGuard>
              <Container fluid>
                <StyledAppContainer className="App">
                  <header className="App-header">
                    <Row>
                      <NavBar />
                    </Row>
                    <Row className="d-flex">
                      <VerticalBar xs={1} sm={1} md={1} className="d-flex" autoWidth={true}>
                        <VerticleNavBar />
                      </VerticalBar>
                      <Col xs={11} sm={11} md={11} className="flex-grow-1 p-0">
                        <Routes>
                          <Route element={<ProtectedRoute />}>
                            <Route path="/" element={<HomePage />}></Route>
                            <Route path="/home" element={<HomePage />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="/notifications/:notificationId" element={<NotificationsPage key={window.location.pathname} />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/settings/manage-user" element={<SettingsPage pageId='manage-user' />} />
                            <Route path="/settings/create-user" element={<SettingsPage pageId='create-user' />} />
                            <Route path="/settings/product-profiles" element={<SettingsPage pageId='product-profiles' />} />
                            <Route path="/settings/spv-management" element={<SettingsPage pageId='spv-management' />} />

                            {/* Case Management Routes */}
                            <Route path="/case-management" element={<CaseManagementPage />} />
                            <Route path="/case-management/:caseId" element={<CaseManagementPage />} />
                            <Route path="/case-management/:caseId/product-setup" element={<CaseManagementPage />} />
                            <Route path="/case-management/:caseId/subscriptions" element={<CaseManagementPage />} />
                            <Route path="/case-management/:caseId/compartment-overview" element={<CaseManagementPage />} />

                            <Route path="/nav-page" element={<NavReportingPage />} />
                            <Route path="/interest-coupon" element={<CouponPage />} />
                            <Route path="/interest-coupon/:caseId" element={<CouponPage />} />
                            <Route path="/buy-sell" element={<BuySellPage />} />
                            <Route path="/buy-sell/:isinId" element={<BuySellPage />} />
                          </Route>
                        </Routes>
                      </Col>
                    </Row>
                  </header>
                </StyledAppContainer>
              </Container>
            </MaintenanceGuard>
          } />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
