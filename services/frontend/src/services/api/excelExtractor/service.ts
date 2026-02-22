import axios from 'axios';
import { ExtractorResponse } from './types';

const EX_BASE_URL = process.env.REACT_APP_EXCEL_EXTRACTOR_API_URL || '';

/**
 * Uploads an Excel file to the extractor service and returns the parsed JSON.
 * @param file Excel file to upload
 * @returns Extracted JSON from the service
 */
export const uploadExcelToExtractor = async (file: File): Promise<ExtractorResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post<ExtractorResponse>(
            `${EX_BASE_URL}`,
            formData,
            {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error while extracting Excel:', error);
        throw error;
    }
};
