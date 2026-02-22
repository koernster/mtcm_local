import React from 'react';
import { PrintHeader } from '../../styled/PrintStyles';

interface AddressInfo {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    registrationNumber?: string;
    type: string;
    title: string;
}

interface PrintHeaderCommonProps {
    logoPath?: string;
    logoAlt?: string;
    logoWidth?: string;
    logoHeight?: string;
    logoMargin?: string;
    address?: AddressInfo;
    fontSize?: string;
    children?: React.ReactNode;
}

const PrintHeaderCommon: React.FC<PrintHeaderCommonProps> = ({
    logoPath = "/logo192.png",
    logoAlt = "Company Logo",
    logoWidth = "160px",
    logoHeight = "60px",
    logoMargin = "15px 0 0 0",
    address = {
        type: 'Address',
        line1: "55 Rue de la Vallée",
        line2: "2661 Luxembourg",
        line3: "Grand Duchy of Luxembourg",
        line4: "",
        registrationNumber: "B264806",
        title: ''
    },
    fontSize = "12px",
    children
}) => {
    return (
        <PrintHeader>
            <div style={{ 
                background: 'linear-gradient(90deg, #778DA9 0%, #B7BDC8 40%, #E0E1DD 100%)', 
                padding: '10px 10px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img 
                                src={logoPath} 
                                alt={logoAlt} 
                                style={{ 
                                    width: logoWidth, 
                                    height: logoHeight, 
                                    margin: logoMargin 
                                }}
                            />
                            {(address.title && <div style={{ 
                                    fontWeight: 'bold', 
                                    marginTop: '5px', 
                                    textAlign: 'center',
                                    fontSize: fontSize 
                                }}>
                                    {address.title}
                                </div>
                            )}
                        </div>
                        {children && (
                            <div style={{ marginLeft: '20px' }}>
                                {children}
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: fontSize, lineHeight: '1.4' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{address.type}:</div>
                        <div>{address.line1}</div>
                        <div>{address.line2}</div>
                        <div>{address.line3}</div>
                        {address.line4 && <div>{address.line4}</div>}
                        {address.registrationNumber && (
                            <div style={{ marginTop: '5px', fontWeight: 'bold' }}>
                                {address.registrationNumber}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PrintHeader>
    );
};

export default PrintHeaderCommon;