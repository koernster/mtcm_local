// Common Print Components
export { default as PrintButton } from './PrintButton';
export { default as PrintModal } from './PrintModal';
export { default as PrintHeaderCommon } from './PrintHeaderCommon';

// Print Utilities
export const printElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print</title>
                        <style>
                            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                            @media print {
                                body { margin: 0; padding: 0; }
                                @page { margin: 1cm; size: A4; }
                            }
                        </style>
                    </head>
                    <body>
                        ${element.outerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }
};

export const printContent = (content: string, title: string = 'Print') => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        @media print {
                            body { margin: 0; padding: 0; }
                            @page { margin: 1cm; size: A4; }
                        }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
};