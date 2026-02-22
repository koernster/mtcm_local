import React from 'react';
import { PrintHeader } from '../../styled/PrintStyles';
import { Spv } from '../../../services/api/graphQL/spv';
import { getImageSrc } from '../../../utils/imageUtils';

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
    spvData?: Spv;
}

const PrintHeaderCommon: React.FC<PrintHeaderCommonProps> = ({
    logoPath = "/logo192.png",
    logoAlt = "Company Logo",
    logoWidth = "160px",
    logoHeight = "60px",
    logoMargin = "20px 0 0 0",
    fontSize = "12px",
    children,
    spvData
}) => {
    return (
        <PrintHeader>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {spvData?.logo ? (
                                <img
                                    src={getImageSrc(spvData.logo)}
                                    alt={logoAlt}
                                    style={{
                                        width: logoWidth,
                                        height: logoHeight,
                                        margin: logoMargin
                                    }}
                                />
                            ) : (
                                <div style={{
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    margin: logoMargin,
                                    textAlign: 'center',
                                }}>
                                    {spvData?.spvtitle}
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
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{spvData?.spvtitle}:</div>
                        {spvData?.companyid && (
                            <div style={{ marginTop: '5px', fontWeight: 'bold' }}>
                                Company ID: {spvData?.companyid}
                            </div>
                        )}
                        <div>{spvData?.address?.addressline1}</div>
                        <div>{spvData?.address?.addressline2}</div>
                        <div>{spvData?.address?.city} {spvData?.address?.country}</div>
                        <div>{spvData?.address?.postalcode}</div>
                    </div>
                </div>
            </div>
        </PrintHeader>
    );
};

export default PrintHeaderCommon;