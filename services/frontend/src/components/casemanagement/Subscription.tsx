import React, { useEffect, useState } from 'react';
import { Accordion, Button, Card, Col, FormControl, FormGroup, InputGroup, OverlayTrigger, Row, Spinner } from 'react-bootstrap';
import { StyledAccordionBody, StyledAccordionHeader, StyledAccordionItem } from '../styled/AccordianStyled';
import { DataLabel, DataValue, StyledCard, StyledFormControl, StyledPopover, StyledPopoverBody,  } from '../styled/CommonStyled';
import { FaAngleDown, FaAngleUp, FaCheckCircle, FaExclamationTriangle,  FaInfoCircle } from 'react-icons/fa';
import { useCaseSetup } from '../../hooks/useCaseSetup';
import { useCaseStatus } from '../../hooks/useCaseStatus';
import { useSubscriptionTrades } from '../../hooks/useSubscriptionTrades';
import { Label, Small } from '../styled/TypographyStyled';
import SkeletonLoading from '../common/SkeletonLoader';
import SubscriptionTradeTable from './subscription/SubscriptionTradeTable';
import SoldSubscriptionsTradeModal from './subscription/SoldSubscriptionTradeModal';
import { FaFileCircleXmark, FaUpload, FaXmark } from 'react-icons/fa6';
import { currencyUtils, dateUtils, percentageUtils } from '../../utils/formatters';
import { env } from 'process';
import InputWrapper from '../common/InputWrapper';

const Subscription: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({ 0: true });
  const [showSoldSubscriptionsModal, setShowSoldSubscriptionsModal] = useState(false);
  const [selectedIsinForSoldSubscriptions, setSelectedIsinForSoldSubscriptions] = useState<{
    isinNumber: string;
    isinCurrency: string;
    isinId: string;
  } | null>(null);
  const [showErrorWarning, setShowErrorWarning] = useState(false);

  const { 
    loading, 
    error, 
    caseData,
    isinEntries,
    isinsLoading,
    isinsError
  } = useCaseSetup();

  // Get case status to determine if table should be editable
  const { canAcceptSubscriptions } = useCaseStatus();

  // Get subscription trades data
  const { 
    currentTrades, 
    soldTrades, 
    loading: tradesLoading, 
    error: tradesError,

    // upload excel
    selectedFile,
    isinUploadStage,
    isinUploadError,
    uploadIsinsWorkflow,
  } = useSubscriptionTrades(caseData?.id || '', caseData?.issuedate || '');

  const toggleItem = (index: number) => {
      setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSoldSubscriptions = (isinNumber: string, isinCurrency: string, isinId: string) => {
    setSelectedIsinForSoldSubscriptions({
      isinNumber,
      isinCurrency,
      isinId
    });
    setShowSoldSubscriptionsModal(true);
  };

  const handleCloseSoldSubscriptionsModal = () => {
    setShowSoldSubscriptionsModal(false);
    setSelectedIsinForSoldSubscriptions(null);
  };

  const renderEndArrow = (i: number) => (
    <div className='float-end'>
      {expandedItems[i] ? <FaAngleUp /> : <FaAngleDown />}
    </div>
  );

  const renderSkeletonList = (itemCount: number, isIsin: boolean = false) => {
    return (
      <>
        {Array(itemCount).fill(null).map((_, index) => (
          <Row key={`skeleton-${index}`}>
              <SkeletonLoading 
                  rows={2} 
                  height={ isIsin? [30]:  [20, 20]} 
                  width={ isIsin ? ['100%'] : ['50%','50%']}
              />
          </Row>
      ))}</>
    );
  };

  const renderProductInfo = () => {
    return (<div className="p-3">
        <Row>
          <Col sm={4}>
            <DataLabel>Client Name: </DataLabel>
            <DataValue>{caseData?.company?.companyname || notAvailable}</DataValue>
          </Col>
          <Col sm={6}>
            <DataLabel>Compartment: </DataLabel>
            <DataValue>{caseData?.compartmentname || notAvailable}</DataValue>
          </Col>
        </Row>
        <Row>
          <Col sm={4}>
            <DataLabel>Issue Date: </DataLabel>
            <DataValue>{dateUtils.format(caseData?.issuedate) || notAvailable}</DataValue>
          </Col>
          <Col sm={4}>
            <DataLabel>Maturity Date: </DataLabel>
            <DataValue>{dateUtils.format(caseData?.maturitydate) || notAvailable}</DataValue>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <hr />
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <DataLabel>Distribution paid by Investor: </DataLabel>
            <DataValue>{caseData?.casesubscriptiondata?.distributionpaidbyinvs ? "YES" : "NO"}</DataValue>
          </Col>
          <Col sm={4}>
            <DataLabel>Sales Fee paid by Investor: </DataLabel>
            <DataValue>{caseData?.casesubscriptiondata?.salesfeepaidbyinves ? "YES" : "NO"}</DataValue>
          </Col>
          <Col sm={4}>
            <DataLabel>On Issue date: </DataLabel>
            <DataValue>{caseData?.casesubscriptiondata?.salesnotpaidissuedate ? percentageUtils.format(caseData?.casesubscriptiondata?.salesnotpaidissuedate) : notAvailable}</DataValue>
          </Col>
          <Col sm={4}>
            <DataLabel>On Maturity date: </DataLabel>
            <DataValue>{caseData?.casesubscriptiondata?.salesnotpaidmaturitydate ? percentageUtils.format(caseData?.casesubscriptiondata?.salesnotpaidmaturitydate) : notAvailable}</DataValue>
          </Col>
        </Row>
      </div>);
  }

  const renderISINAccordions = () => {
    if (!isinEntries || isinEntries.length === 0) {
      return (<Label className='text-warning'>No ISINs available</Label>);
    }else{
      return (isinEntries.map((entry, index) => {
        // Filter trades for this specific ISIN
        const isinCurrentTrades = currentTrades.filter(trade => trade.isin_id === entry.id);
        
        return (
          <StyledAccordionItem as={Accordion.Item} eventKey={(index+1).toString()} key={entry.id}>
            <StyledAccordionHeader onClick={() => toggleItem(index+1)}>
              <div className="d-flex justify-content-between align-items-center w-100">
              <div>
                <div>{entry.isinNumber || 'Unnamed ISIN'}</div>
                <Small>
                  <b>Currency: </b>{entry.currency} 
                  &nbsp;— <b>Notional: </b>{currencyUtils.format(Number(entry?.issueSize), {
                    currency: entry.currency
                  })} 
                  &nbsp;— <b>Settlement: </b>{currencyUtils.format(entry?.issuePrice, {
                    currency: entry.currency
                  })}
                </Small>
              </div>
              {renderEndArrow(index+1)}
              </div>
            </StyledAccordionHeader>
            <StyledAccordionBody as={Accordion.Body}>
              <SubscriptionTradeTable 
                data={isinCurrentTrades}
                isLoading={tradesLoading}
                isEditable={canAcceptSubscriptions} // Controlled by case status
                currency={entry.currency}
              />
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  onClick={() => handleSoldSubscriptions(entry.isinNumber, entry.currency, entry.id)}
                >
                  <FaFileCircleXmark size={16} className="me-1" />
                  Cancelled Subscriptions
                </Button>
              </div>
          </StyledAccordionBody>
        </StyledAccordionItem>
        );
      }));
    }
  }

  const notAvailable = (<Label className='text-warning'>N/A</Label>);

  const getProcessingStageIcon = (isinUploadStage: string): React.ReactNode => {
    //create a popover for error and warning to show full message
    const popover = (message: string|string[], isError:boolean = false) => {
      return (
        <OverlayTrigger
          trigger="focus"
          placement="bottom"
          show={showErrorWarning}
          onToggle={setShowErrorWarning}
          overlay={<StyledPopover id="erorr-wraning-popover">
            <StyledPopoverBody>
              {
                message && (Array.isArray(message) ? (
                  <div>
                    <b>The following {isError ? 'errors were found: ' : 'validations failed!'}</b>
                    <ul>
                      {message.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <b>{isError ? 'Error' : 'Warning'}:</b> {message}
                  </div>
                ))}
            </StyledPopoverBody>
          </StyledPopover>}
        >
          <span style={{ cursor: 'pointer' }} onClick={() => setShowErrorWarning(!showErrorWarning)}>
            {isError ? <Small  className="text-danger" ><FaXmark/> {Array.isArray(isinUploadError) ? 'Multiple errors found' : "Error"}</Small>
            : <Small className="text-warning"><FaExclamationTriangle /> File Validation Failed</Small>}
          </span>
        </OverlayTrigger>
      );
    };

    switch (isinUploadStage) {
      case 'idle':
        return null;
      case 'uploading':
      case 'validating':
      case 'preparing':
        return (<Small>
          <Spinner
            animation="border"
            size="sm"
            style={{ width: '16px', height: '16px' }}
          /> {isinUploadStage.charAt(0).toUpperCase() + isinUploadStage.slice(1)}...
        </Small>);
      case 'done':
        return <Small><FaCheckCircle className="text-success" /> Upload successful</Small>;
      case 'error':
        return popover(isinUploadError || 'An error occurred during upload', true);
      case 'warning':
        return popover(
          Array.isArray(isinUploadError)
            ? isinUploadError.filter((msg): msg is string => typeof msg === 'string')
            : [isinUploadError].filter((msg): msg is string => typeof msg === 'string')
        );
      case 'norecords':
        return (<Small><FaInfoCircle className="text-success" /> No valid records found.</Small>);
      default:
        return null;
    }
  }

  const handleUploadIsinsWorkflow = async () => {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .xls'; // Accept only Excel files

    // Listen for file selection
    fileInput.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        await uploadIsinsWorkflow(file);
      }
    };

    // Trigger the file input dialog
    fileInput.click();
  }

  return (
    <>
      <Row>
        <Col sm={12}>
          <StyledCard animate={false}>
            <Card.Body style={{ padding: '0.50rem' }}>
            {
              loading ? 
              renderSkeletonList(3)
              : error ?
              (<Label className='text-danger'>Error loading product information</Label>)
              : renderProductInfo()
            }
            </Card.Body>
          </StyledCard>
        </Col>
        
        <Col sm={12}>
          {/* Header and Controls */}
          <hr style={{ margin: '0.5rem 0', borderColor: '#dee2e6', borderWidth: '1px' }} />
          
          <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'left' }}>
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <FormGroup>
                <InputGroup>
                  {selectedFile && <StyledFormControl
                    type="text"
                    size="sm"
                    disabled={true}
                    value={selectedFile.name}
                  />}
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={handleUploadIsinsWorkflow}
                    >
                    <FaUpload />  Upload ISIN(s) Excel
                  </Button>
                </InputGroup>
            </FormGroup>
            {getProcessingStageIcon(isinUploadStage)}
            </div>
          </div>

          {/* ISIN Accordions */}
          <Accordion activeKey={Object.keys(expandedItems).filter(k => expandedItems[+k])} flush>
            <StyledAccordionItem as={Accordion.Item} eventKey='0'>
              <StyledAccordionHeader onClick={() => toggleItem(0)}>
                ISIN(s)
                {renderEndArrow(0)}
              </StyledAccordionHeader>
              <StyledAccordionBody as={Accordion.Body}>
                {
                  isinsLoading ?
                  (<> {renderSkeletonList(3, true)} </>) 
                  : isinsError ?
                  (<Label className='text-danger'>Error loading ISINs</Label>) 
                  : 
                  renderISINAccordions()
                }
              </StyledAccordionBody>
            </StyledAccordionItem>
          </Accordion>
        </Col>
      </Row>

      {/* History Modal */}
      {selectedIsinForSoldSubscriptions && (
        <SoldSubscriptionsTradeModal
          show={showSoldSubscriptionsModal}
          onHide={handleCloseSoldSubscriptionsModal}
          isinNumber={selectedIsinForSoldSubscriptions.isinNumber}
          isinCurrency={selectedIsinForSoldSubscriptions.isinCurrency}
          soldTrades={soldTrades.filter(trade => trade.isin_id === selectedIsinForSoldSubscriptions.isinId)}
          caseId={caseData?.id || ''}
        />
      )}
    </>
  );
};

export default Subscription;