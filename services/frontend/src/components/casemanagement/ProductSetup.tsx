import React, { useState, useEffect } from 'react';
import { CompartmentStatus } from '../../types/CompartmentStatus';
import { Accordion, Col, Container, Row } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';
import { StyledButton } from '../styled/CommonStyled';
import { FaAngleDown, FaAngleUp, FaRegCircleXmark } from 'react-icons/fa6';
import { StyledAccordionBody, StyledAccordionHeader, StyledAccordionItem } from '../styled/AccordianStyled';
import SkeletonLoading from '../common/SkeletonLoader';
import { useCaseSetup } from '../../hooks/useCaseSetup';
import BasicProductInfo from './productsetup/BasicProductInfo';
import FeesAndCosts from './productsetup/FeesAndCosts';
import FinStructureDetails from './productsetup/FinStructureDetals';
import KeyDateSchedules from './productsetup/KeyDatesSchedules';
import PartiesInvolved from './productsetup/PartiesInvolved';
import DocumentArchive from './productsetup/DocumentArchive';
import { FaInfoCircle } from 'react-icons/fa';

const ProductSetup: React.FC = () => {
    const { theme } = useTheme();
    const { loading, error, caseData, updateCase, activeCaseId } = useCaseSetup();
    
    // Mapping between accordion indices and status IDs from database
    const accordionToStatusMapping = {
        0: CompartmentStatus.BASIC_PROD_INFO,
        1: CompartmentStatus.FEES_ND_COST,
        2: CompartmentStatus.FIN_STR_DTIL,
        3: CompartmentStatus.KEY_DT_SCHDL,
        4: CompartmentStatus.PARTIES_INVL,
        5: CompartmentStatus.DOC_ARCH,
    };

    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({
        0: true,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
    });

    // Flag to track if accordion state has been initialized from database
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize accordion state based on current productsetupstatusid
    useEffect(() => {
        if ((!loading) && caseData && activeCaseId) {
            // Find which accordion corresponds to the current status
            const currentAccordionIndex = Object.entries(accordionToStatusMapping)
                .find(([_, statusId]) => statusId === Number(caseData.productsetupstatusid))?.[0];
            
            if (currentAccordionIndex !== undefined) {
                const index = parseInt(currentAccordionIndex);
                // Close all first, then open the correct one
                setExpandedItems({
                    0: false,
                    1: false,
                    2: false,
                    3: false,
                    4: false,
                    5: false,
                    [index]: true
                });
            }
            else{
                setExpandedItems({
                    0: true,
                    1: false,
                    2: false,
                    3: false,
                    4: false,
                    5: false,
                });
            }
        }

    }, [loading, caseData, activeCaseId]);

    const updateProductSetupStatus = async (accordionIndex: number) => {
        const statusId = accordionToStatusMapping[accordionIndex as keyof typeof accordionToStatusMapping];
        if (statusId && caseData) {
            try {
                await updateCase({ productsetupstatusid: statusId }, true); // Skip loading for status updates
            } catch (error) {
                console.error('Failed to update product setup status:', error);
            }
        }
    };

    const toggleItem = async (index: number) => {
        const isCurrentlyExpanded = expandedItems[index];
        setExpandedItems(prevState => ({
            ...prevState,
            [index]: !prevState[index],
        }));
        // If opening an accordion (not closing), update the status
        if (!isCurrentlyExpanded) {
            await updateProductSetupStatus(index);
        }
    };

    const expandAll = async () => {
        // If productsetupstatusid is CASE_FREEZED, only allow FIN_STR_DTIL (index 2)
        if (caseData?.productsetupstatusid === CompartmentStatus.CASE_FREEZED) {
            setExpandedItems({
                0: false,
                1: false,
                2: true, // FIN_STR_DTIL
                3: false,
                4: false,
                5: false,
            });
            return;
        }
        const allExpanded = Object.keys(expandedItems).every(
            key => expandedItems[Number(key)]
        );
        const newExpandedState = Object.keys(expandedItems).reduce(
            (acc, key) => ({
                ...acc,
                [Number(key)]: !allExpanded,
            }),
            {}
        );
        setExpandedItems(newExpandedState);
        // If opening all, update status to the last accordion (Document Archive - index 5)
        if (!allExpanded) {
            await updateProductSetupStatus(5);
        }
    };

    const renderEndArrow = (i: number) => {
        return <div className='float-end'>
            {expandedItems[i] ? <FaAngleUp /> : <FaAngleDown />}
        </div>;
    }    
    
    const renderSkeletonAccordion = () => (
        <Accordion flush>
            {[...Array(6)].map((_, index) => (
                <SkeletonLoading key={index} rows={1} height={[45]} />
            ))}
        </Accordion>
    );

    if (error) {
        return (
            <Container fluid>
                <div className="text-center mt-5">
                    <FaRegCircleXmark className="text-danger" size={50} />
                    <p className="text-danger mt-3">
                        Failed to load case data.
                        <br />Please try again later.
                    </p>
                </div>
            </Container>
        );
    }

    return (        
        <Row >
            <Col sm={12} md={12} xs={12} style={{ 
                padding: 0,
                overflowX: 'hidden'
            }}>
                {loading ? (
                    renderSkeletonAccordion()
                ) : (
                    <Accordion
                        activeKey={Object.keys(expandedItems).filter(k => expandedItems[Number(k)])} 
                        flush
                        className="mb-3"
                    >
                        <StyledAccordionItem as={Accordion.Item} eventKey="0">
                            <StyledAccordionHeader onClick={() => toggleItem(0)}>
                                Basic Product Information
                                &nbsp; <FaInfoCircle />
                                {renderEndArrow(0)}
                            </StyledAccordionHeader>
                            <StyledAccordionBody as={Accordion.Body}>
                                <BasicProductInfo />
                            </StyledAccordionBody>
                        </StyledAccordionItem>

                        <StyledAccordionItem as={Accordion.Item} eventKey="4">
                            <StyledAccordionHeader onClick={() => toggleItem(4)}>
                                Parties Involved
                                &nbsp; <FaInfoCircle />
                                {renderEndArrow(4)}
                            </StyledAccordionHeader>
                            <StyledAccordionBody as={Accordion.Body}>
                                <PartiesInvolved />
                            </StyledAccordionBody>
                        </StyledAccordionItem>
                        
                        <StyledAccordionItem as={Accordion.Item} eventKey="2">
                            <StyledAccordionHeader onClick={() => toggleItem(2)}>
                                Financial and Structural Details
                                &nbsp; <FaInfoCircle />
                                {renderEndArrow(2)}
                            </StyledAccordionHeader>
                            <StyledAccordionBody as={Accordion.Body}>
                                <FinStructureDetails />
                            </StyledAccordionBody>
                        </StyledAccordionItem>

                        <StyledAccordionItem as={Accordion.Item} eventKey="1">
                            <StyledAccordionHeader onClick={() => toggleItem(1)}>
                                Fees and Costs
                                &nbsp; <FaInfoCircle />
                                {renderEndArrow(1)}
                            </StyledAccordionHeader>
                            <StyledAccordionBody as={Accordion.Body}>
                                <FeesAndCosts />
                            </StyledAccordionBody>
                        </StyledAccordionItem>
                        
                        <StyledAccordionItem as={Accordion.Item} eventKey="3">
                            <StyledAccordionHeader onClick={() => toggleItem(3)}>
                                Key Dates and Schedules
                                &nbsp; <FaInfoCircle />
                                {renderEndArrow(3)}
                            </StyledAccordionHeader>
                            <StyledAccordionBody as={Accordion.Body}>
                                <KeyDateSchedules />
                            </StyledAccordionBody>
                        </StyledAccordionItem>

                        {/* <StyledAccordionItem as={Accordion.Item} eventKey="5">
                            <StyledAccordionHeader onClick={() => toggleItem(5)}>
                                Document Archive
                                &nbsp; <FaInfoCircle />
                                {renderEndArrow(5)}
                            </StyledAccordionHeader>
                            <StyledAccordionBody as={Accordion.Body}>
                                <DocumentArchive />
                            </StyledAccordionBody>
                        </StyledAccordionItem> */}
                    </Accordion>
                )}
            </Col>
        </Row>
    );
}

export default ProductSetup;