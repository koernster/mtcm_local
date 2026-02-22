import React from 'react';
import { LineSeparator } from '../../styled/PrintStyles';

interface PrintFooterCommonProps {
    variant?: 'invoice' | 'report' | 'simple';
    showDisclaimer?: boolean;
    showContactInfo?: boolean;
    showSignature?: boolean;
    customMessage?: string;
}

const PrintFooterCommon: React.FC<PrintFooterCommonProps> = ({
    variant = 'simple',
    showDisclaimer = false,
    showContactInfo = false,
    showSignature = false,
    customMessage
}) => {
    const renderInvoiceFooter = () => (
        <div style={{ marginTop: '10px', fontSize: '11px', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '30px' }}>
                {customMessage || 'Contact your sales representative if you have any questions regarding this invoice.'}
            </div>
            
            {showSignature && (
                <div>
                    <div style={{ marginBottom: '5px' }}>Sincerely,</div>
                    <div style={{ fontWeight: 'bold' }}>MTCM Securities SA</div>
                </div>
            )}
        </div>
    );

    const renderReportDisclaimer = () => (
        <div style={{ 
            marginTop: '30px', 
            fontSize: '10px', 
            lineHeight: '1.4', 
            fontStyle: 'italic',
            textAlign: 'justify',
            color: '#666'
        }}>
            The overview and interests calculation on this document is provided for informational purposes only, and while every effort has been made to ensure accuracy. MTCM is not liable for any potential typographical errors or discrepancies in the document.
        </div>
    );

    const renderContactInfo = () => (
        <div style={{ marginTop: '20px' }}>
            <LineSeparator />
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '10px',
                marginTop: '10px',
                color: '#333'
            }}>
                <div>reporting@mtcm.lu</div>
                <div>T: (+352) 20334311</div>
                <div>www.mtcm.lu</div>
            </div>
        </div>
    );

    return (
        <>
            {variant === 'invoice' && renderInvoiceFooter()}
            
            {showDisclaimer && renderReportDisclaimer()}
            
            {showContactInfo && renderContactInfo()}
            
            {variant === 'simple' && customMessage && (
                <div style={{ marginTop: '20px', fontSize: '11px', lineHeight: '1.6' }}>
                    {customMessage}
                </div>
            )}
        </>
    );
};

export default PrintFooterCommon;