import React, { useRef, useEffect, useState } from 'react';
import { Modal, Button, ButtonGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight, FaPrint } from 'react-icons/fa';
import { StyledModal, StyledButton, StyledSelect } from '../../styled/CommonStyled';
import PrintButton from './PrintButton';

// A4 page dimensions (210mm x 297mm at 96 DPI)
const A4_WIDTH_PX = 794; // 210mm
const A4_HEIGHT_PX = 1123; // 297mm

const PrintPreviewContainer = styled.div`
    background-color: #f5f5f5;
    padding: 20px;
    min-height: 70vh;
    max-height: 70vh;
    overflow-y: auto;
`;

interface PrintPageProps {
    margin: number;
    fontSize: number;
    orientation: 'portrait' | 'landscape';
}

const PrintPage = styled.div<PrintPageProps>`
    width: ${props => props.orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX}px;
    min-height: ${props => props.orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX}px;
    background: white;
    margin: 0 auto 20px auto;
    padding: ${props => props.margin * 96}px; /* Convert inches to pixels (96 DPI) */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
    position: relative;
    overflow: hidden;
    font-size: ${props => props.fontSize}%;
    
    @media (max-width: 850px) {
        transform: scale(0.8);
        transform-origin: top center;
        margin-bottom: 0;
    }
    
    @media (max-width: 680px) {
        transform: scale(0.6);
        transform-origin: top center;
        margin-bottom: -200px;
    }
`;

const PageNumber = styled.div`
    position: absolute;
    bottom: 20px;
    right: 48px;
    font-size: 12px;
    color: #666;
`;

const PrintControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: ${({ theme }) => theme.background};
    border-bottom: 1px solid ${({ theme }) => theme.border};
    box-shadow: 0 1px 2px ${({ theme }) => theme.border}22;
    flex-wrap: wrap;
    gap: 8px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const ControlSection = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    
    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const PageControls = styled(ControlSection)``;

const PrintSettings = styled(ControlSection)`
    border-left: 1px solid ${({ theme }) => theme.border};
    padding-left: 12px;
    
    @media (max-width: 768px) {
        border-left: none;
        border-top: 1px solid ${({ theme }) => theme.border};
        padding-left: 0;
        padding-top: 8px;
        margin-top: 4px;
    }
`;

const SettingGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const SettingLabel = styled.label`
    font-size: 10px;
    color: ${({ theme }) => theme.text};
    margin: 0;
    white-space: nowrap;
`;



const SettingCheckbox = styled.input`
    margin: 0;
    transform: scale(0.8);
`;

const PageInfo = styled.span`
    font-size: 12px;
    color: ${({ theme }) => theme.text};
    min-width: 100px;
    text-align: center;
    font-weight: 500;
`;

interface PrintModalProps {
    show: boolean;
    onHide: () => void;
    title?: string;
    size?: 'sm' | 'lg' | 'xl';
    centered?: boolean;
    children: React.ReactNode | React.ReactNode[];
    onPrint?: () => void;
    printButtonText?: string;
    showPrintButton?: boolean;
    multiPageMode?: boolean; // New prop to enable multi-page mode
}

/**
 * Common print modal component that provides a consistent print preview experience
 * Includes a print button in the footer by default
 */
const PrintModal: React.FC<PrintModalProps> = ({
    show,
    onHide,
    title = 'Print Preview',
    size = 'xl',
    centered = true,
    children,
    onPrint,
    printButtonText = 'Print',
    showPrintButton = true,
    multiPageMode = false
}) => {
    const printContentRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<React.ReactNode[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [printMargin, setPrintMargin] = useState(0.25); // in inches
    const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [showPrintColors, setShowPrintColors] = useState(true);
    const [fontSize, setFontSize] = useState(100); // percentage

    // Calculate pages when modal opens or content changes
    useEffect(() => {
        if (show && measureRef.current) {
            calculatePages();
            setCurrentPage(1); // Reset to first page when modal opens
        }
    }, [show, children]);

    const scrollToPage = (pageNum: number) => {
        const pageElement = document.querySelector(`[data-page="${pageNum}"]`);
        if (pageElement) {
            pageElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    };

    const goToNextPage = () => {
        if (currentPage < pages.length) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            setTimeout(() => scrollToPage(nextPage), 100);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            setTimeout(() => scrollToPage(prevPage), 100);
        }
    };

    const goToPage = (pageNum: number) => {
        if (pageNum >= 1 && pageNum <= pages.length) {
            setCurrentPage(pageNum);
            setTimeout(() => scrollToPage(pageNum), 100);
        }
    };

    const calculatePages = () => {
        if (multiPageMode && Array.isArray(children)) {
            // Multi-page mode: each child is a separate page
            setPages(children);
            return;
        }

        if (!measureRef.current) return;

        // Single page mode with automatic pagination
        // A4 content height minus margins (1123px - 96px padding)
        const pageContentHeight = A4_HEIGHT_PX - 96; // 96px = 48px top + 48px bottom padding
        const contentHeight = measureRef.current.scrollHeight;
        
        if (contentHeight <= pageContentHeight) {
            // Content fits in one page
            setPages([children]);
        } else {
            // Content needs multiple pages - for now, we'll show the content as is
            // This is a simplified approach - for complex pagination, we'd need more sophisticated logic
            const numPages = Math.ceil(contentHeight / pageContentHeight);
            const pageArray = [];
            
            for (let i = 0; i < numPages; i++) {
                pageArray.push(
                    <div key={i} style={{ 
                        height: i === numPages - 1 ? 'auto' : `${pageContentHeight}px`,
                        overflow: 'hidden'
                    }}>
                        {i === 0 ? children : <div style={{ marginTop: `-${i * pageContentHeight}px` }}>{children}</div>}
                    </div>
                );
            }
            setPages(pageArray);
        }
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            // Print only the modal content with all styling preserved
            if (printContentRef.current) {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    const printContent = printContentRef.current.innerHTML;
                    
                    // Get all stylesheets from the current page
                    const styleSheets = Array.from(document.styleSheets);
                    let allStyles = '';
                    
                    // Copy all CSS rules from stylesheets
                    styleSheets.forEach(styleSheet => {
                        try {
                            if (styleSheet.cssRules) {
                                Array.from(styleSheet.cssRules).forEach(rule => {
                                    allStyles += rule.cssText + '\n';
                                });
                            }
                        } catch (e) {
                            // Handle CORS issues with external stylesheets
                            console.warn('Could not access stylesheet:', e);
                        }
                    });
                    
                    // Also get inline styles from style tags
                    const styleTags = document.querySelectorAll('style');
                    styleTags.forEach(styleTag => {
                        allStyles += styleTag.innerHTML + '\n';
                    });
                    
                    printWindow.document.open();
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Print</title>
                            <meta charset="utf-8">
                            <style>
                                ${allStyles}
                                
                                /* Additional print-specific styles */
                                @media print {
                                    body { 
                                        margin: 0; 
                                        -webkit-print-color-adjust: ${showPrintColors ? 'exact' : 'economy'};
                                        color-adjust: ${showPrintColors ? 'exact' : 'economy'};
                                        font-size: ${fontSize}%;
                                    }
                                    @page { 
                                        size: A4 ${pageOrientation}; 
                                        margin: ${printMargin}in; 
                                    }
                                    * {
                                        -webkit-print-color-adjust: ${showPrintColors ? 'exact' : 'economy'} !important;
                                        color-adjust: ${showPrintColors ? 'exact' : 'economy'} !important;
                                    }
                                    /* Page break styles for multi-page mode */
                                    div[style*="pageBreakAfter"] {
                                        page-break-after: always !important;
                                        break-after: page !important;
                                    }
                                    div[style*="pageBreakInside"] {
                                        page-break-inside: avoid !important;
                                        break-inside: avoid !important;
                                    }
                                }
                                @media screen {
                                    body {
                                        margin: 0;
                                        padding: 0;
                                        font-size: ${fontSize}%;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            ${printContent}
                        </body>
                        </html>
                    `);
                    printWindow.document.close();
                    
                    // Wait for content to load then print
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 500);
                }
            }
        }
    };

    return (
        <StyledModal 
            show={show} 
            onHide={onHide}
            size={size}
            centered={centered}
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            
            {/* Print Controls */}
            <PrintControls>
                <PageControls>
                    <Button 
                        variant="secondary"
                        size='sm'
                        onClick={goToPrevPage}
                        disabled={currentPage === 1 || pages.length <= 1}
                    >
                        <FaChevronLeft />
                        Previous
                    </Button>
                    
                    <PageInfo>
                        {pages.length > 0 ? `Page ${currentPage} of ${pages.length}` : 'Page 1'}
                    </PageInfo>
                    
                    <Button 
                        variant="secondary"
                        size='sm'
                        onClick={goToNextPage}
                        disabled={currentPage === pages.length || pages.length <= 1}
                    >
                        Next <FaChevronRight />
                    </Button>
                </PageControls>
                
                <PrintSettings>
                    <SettingGroup>
                        <SettingLabel>Margin:</SettingLabel>
                        <StyledSelect 
                            value={printMargin}
                            size='sm'
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPrintMargin(parseFloat(e.target.value))}
                        >
                            <option value={0.25}>0.25 in</option>
                            <option value={0.5}>0.5 in</option>
                            <option value={0.75}>0.75 in</option>
                            <option value={1}>1 in</option>
                            <option value={1.25}>1.25 in</option>
                            <option value={1.5}>1.5 in</option>
                            <option value={2}>2 in</option>
                        </StyledSelect>
                    </SettingGroup>
                    
                    <SettingGroup>
                        <SettingLabel>Size:</SettingLabel>
                        <StyledSelect 
                            value={fontSize}
                            size='sm'
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFontSize(parseInt(e.target.value))}
                        >
                            <option value={50}>50%</option>
                            <option value={60}>60%</option>
                            <option value={70}>70%</option>
                            <option value={80}>80%</option>
                            <option value={90}>90%</option>
                            <option value={100}>100%</option>
                            <option value={110}>110%</option>
                            <option value={120}>120%</option>
                            <option value={130}>130%</option>
                            <option value={150}>150%</option>
                            <option value={175}>175%</option>
                            <option value={200}>200%</option>
                        </StyledSelect>
                    </SettingGroup>
                    
                    <SettingGroup>
                        <SettingLabel>Orient:</SettingLabel>
                        <StyledSelect 
                            value={pageOrientation}
                            size='sm'
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPageOrientation(e.target.value as 'portrait' | 'landscape')}
                        >
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                        </StyledSelect>
                    </SettingGroup>
                    
                    <SettingGroup>
                        <SettingCheckbox 
                            type="checkbox" 
                            checked={showPrintColors}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowPrintColors(e.target.checked)}
                            id="printColors"
                        />
                        <SettingLabel htmlFor="printColors">Colors</SettingLabel>
                    </SettingGroup>
                </PrintSettings>
                
                <ControlSection>
                    <Button 
                        variant="outline-success"
                        onClick={handlePrint}
                        size="sm"
                    >
                        <FaPrint /> Print
                    </Button>
                </ControlSection>
            </PrintControls>
            
            <Modal.Body style={{ padding: 0 }}>
                <PrintPreviewContainer>
                    {/* Hidden content for printing */}
                    <div ref={printContentRef} style={{ display: 'none' }}>
                        {multiPageMode && Array.isArray(children) ? (
                            children.map((child, index) => (
                                <div key={index} style={{ 
                                    pageBreakAfter: index < children.length - 1 ? 'always' : 'auto',
                                    pageBreakInside: 'avoid',
                                    minHeight: '100vh'
                                }}>
                                    {child}
                                </div>
                            ))
                        ) : (
                            children
                        )}
                    </div>
                    
                    {/* Hidden measurement div */}
                    <div 
                        ref={measureRef} 
                        style={{ 
                            position: 'absolute', 
                            top: '-9999px', 
                            left: '-9999px',
                            width: `${A4_WIDTH_PX - 96}px`, // A4 width minus padding
                            visibility: 'hidden'
                        }}
                    >
                        {multiPageMode && Array.isArray(children) ? children[0] : children}
                    </div>
                    
                    {/* Preview pages - show all pages */}
                    {pages.length > 0 ? (
                        pages.map((pageContent, index) => (
                            <PrintPage 
                                key={index}
                                data-page={index + 1}
                                margin={printMargin} 
                                fontSize={fontSize} 
                                orientation={pageOrientation}
                                style={{
                                    border: currentPage === index + 1 ? '2px solid #007bff' : '1px solid #ddd',
                                    boxShadow: currentPage === index + 1 
                                        ? '0 4px 12px rgba(0, 123, 255, 0.3)' 
                                        : '0 4px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <div style={{ height: '100%', overflow: 'hidden' }}>
                                    {pageContent}
                                </div>
                                <PageNumber>Page {index + 1} of {pages.length}</PageNumber>
                            </PrintPage>
                        ))
                    ) : (
                        /* Default single page if no pages calculated yet */
                        <PrintPage 
                            data-page={1}
                            margin={printMargin} 
                            fontSize={fontSize} 
                            orientation={pageOrientation}
                            style={{
                                border: '2px solid #007bff',
                                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                            }}
                        >
                            <div style={{ height: '100%', overflow: 'hidden' }}>
                                {children}
                            </div>
                            <PageNumber>Page 1</PageNumber>
                        </PrintPage>
                    )}
                </PrintPreviewContainer>
            </Modal.Body>

        </StyledModal>
    );
};

export default PrintModal;