import styled from 'styled-components';

export const PrintContainer = styled.div`
    @media print {
        margin: 0;
        padding: 20px;
        font-size: 12px;
        color: black;
        background: white;
    }
    
    @media screen {
        padding: 20px;
        background: white;
        color: black;
        max-width: 210mm;
        margin: 0 auto;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
`;

export const PrintHeader = styled.div`
    text-align: center;
    margin-bottom: 10px;
    
    h1 {
        font-size: 18px;
        font-weight: bold;
        margin: 0 0 5px 0;
    }
    
    h2 {
        font-size: 14px;
        font-weight: normal;
        margin: 0 0 10px 0;
        color: #666;
    }
    
    .report-date {
        font-size: 11px;
        color: #999;
    }
`;

export const LineSeparator = styled.hr`
    border: none;
    border-top: 1px solid #333;
    margin: 5px 0;
`;

export const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    
    th, td {
        border: 1px solid #333;
        padding: 6px 8px;
        text-align: left;
    }
    
    th {
        background-color: #f5f5f5;
        font-weight: bold;
        text-align: center;
    }
    
    .text-right {
        text-align: right;
    }
    
    .text-center {
        text-align: center;
    }
    
    tfoot td {
        font-weight: bold;
        background-color: #f9f9f9;
    }
    
    .highlighted-row td {
        background-color: #fff3cd;
        border-top: 2px solid #333;
        font-weight: bold;
    }
`;

// Common table style for inline tables (bank details, etc.)
export const InlineTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #333;
    font-size: 11px;
    margin-bottom: 20px;
    
    th {
        background-color: #f5f5f5;
        padding: 8px;
        border: 1px solid #333;
        font-weight: bold;
        text-align: left;
        font-size: 11px;
    }
    
    td {
        padding: 6px 8px;
        border: 1px solid #333;
        
        &.label {
            font-weight: bold;
        }
    }
    
    /* Last table in a series has no margin bottom */
    &:last-of-type {
        margin-bottom: 0;
    }
`;

export const SummaryBox = styled.div`
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #333;
    background-color: #f8f9fa;
    
    h3 {
        font-size: 12px;
        font-weight: bold;
        margin: 0 0 10px 0;
    }
    
    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 11px;
    }
    
    .summary-total {
        border-top: 1px solid #333;
        padding-top: 5px;
        font-weight: bold;
    }
`;

export const PrintButton = styled.button`
    padding: 10px 20px;
    font-size: 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        background-color: #0056b3;
    }
    
    @media print {
        display: none !important;
    }
`;

export const PrintStyles = styled.div`
    @media print {
        .print-hide {
            display: none !important;
        }
        
        body {
            margin: 0;
            padding: 0;
        }
        
        @page {
            margin: 1cm;
            size: A4;
        }
    }
`;