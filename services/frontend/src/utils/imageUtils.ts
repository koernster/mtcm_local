/**
 * Image Utility Functions
 * 
 * Common utilities for handling image data, format detection, and conversion.
 */

/**
 * Detects the image MIME type from base64 or binary data by checking magic bytes
 * @param data - base64 string or hex-encoded bytea string
 * @returns The detected MIME type (e.g., 'image/png', 'image/jpeg')
 */
export const detectImageMimeType = (data: string): string => {
    // Default fallback
    const defaultMime = 'image/png';

    if (!data || data.length < 4) {
        return defaultMime;
    }

    let base64Data = data;

    // Handle data URL - extract base64 part
    if (data.startsWith('data:')) {
        const match = data.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
            return match[1]; // Return the MIME type from data URL
        }
        const base64Index = data.indexOf('base64,');
        if (base64Index !== -1) {
            base64Data = data.substring(base64Index + 7);
        }
    }

    // Handle hex-encoded bytea (starts with \x)
    if (data.startsWith('\\x')) {
        const cleanHex = data.slice(2);
        // Check hex magic bytes directly
        if (cleanHex.startsWith('89504e47')) return 'image/png';
        if (cleanHex.startsWith('ffd8ff')) return 'image/jpeg';
        if (cleanHex.startsWith('47494638')) return 'image/gif';
        if (cleanHex.startsWith('52494646') && cleanHex.substring(16, 24) === '57454250') return 'image/webp';
        if (cleanHex.startsWith('424d')) return 'image/bmp';
        if (cleanHex.startsWith('3c3f786d6c') || cleanHex.startsWith('3c737667')) return 'image/svg+xml';
        return defaultMime;
    }

    // Check base64 magic bytes (first 4-8 characters represent first few bytes)
    // PNG: 89 50 4E 47 -> iVBOR in base64
    if (base64Data.startsWith('iVBOR')) return 'image/png';

    // JPEG: FF D8 FF -> /9j/ in base64
    if (base64Data.startsWith('/9j/')) return 'image/jpeg';

    // GIF: 47 49 46 38 -> R0lG in base64
    if (base64Data.startsWith('R0lG')) return 'image/gif';

    // WebP: 52 49 46 46 ... 57 45 42 50 -> RIFF...WEBP (UklGR in base64)
    if (base64Data.startsWith('UklGR')) return 'image/webp';

    // BMP: 42 4D -> Qk in base64
    if (base64Data.startsWith('Qk')) return 'image/bmp';

    // SVG (text-based, starts with <?xml or <svg)
    if (base64Data.startsWith('PD94bW') || base64Data.startsWith('PHN2Zw')) return 'image/svg+xml';

    return defaultMime;
};

/**
 * Converts hex string (PostgreSQL bytea format) to the original string
 * PostgreSQL returns bytea as hex-encoded string starting with \x
 * This function decodes the hex back to the original text
 * 
 * @param hexString - Hex string starting with \x
 * @returns Decoded string (could be base64 or other text)
 */
export const hexToString = (hexString: string): string => {
    // Remove \x prefix if present
    const cleanHex = hexString.startsWith('\\x') ? hexString.slice(2) : hexString;

    try {
        const bytes = cleanHex.match(/.{1,2}/g) || [];
        return bytes.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
    } catch {
        return '';
    }
};

/**
 * Converts hex string (PostgreSQL bytea format) to base64
 * Note: Use hexToString if the bytea contains text (like base64)
 * Use this only if bytea contains raw binary data
 * 
 * @param hexString - Hex string starting with \x
 * @returns base64 encoded string
 */
export const hexToBase64 = (hexString: string): string => {
    // Remove \x prefix if present
    const cleanHex = hexString.startsWith('\\x') ? hexString.slice(2) : hexString;

    try {
        const bytes = new Uint8Array(
            cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        return btoa(binary);
    } catch {
        return '';
    }
};

/**
 * Check if a string is valid base64
 * @param str - String to validate
 * @returns true if valid base64
 */
export const isValidBase64 = (str: string): boolean => {
    if (!str || str.length === 0) return false;
    // Base64 pattern: alphanumeric, +, /, and = for padding
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(str) && str.length % 4 === 0;
};

/**
 * Extracts pure base64 from a data URL
 * @param dataUrl - Data URL string (e.g., data:image/png;base64,...)
 * @returns Pure base64 string without the data URL prefix
 */
export const extractBase64FromDataUrl = (dataUrl: string): string => {
    const base64Prefix = 'base64,';
    const index = dataUrl.indexOf(base64Prefix);
    if (index !== -1) {
        return dataUrl.substring(index + base64Prefix.length);
    }
    return dataUrl;
};

/**
 * Creates a displayable image source (data URL) from various input formats
 * Handles data URLs, pure base64, hex-encoded bytea strings, and regular URLs
 * Automatically detects the correct image format
 * 
 * @param value - Image data in any supported format
 * @returns A valid URL or data URL for use in img src attribute
 */
export const getImageSrc = (value: string): string => {
    if (!value) return '';

    // Already a data URL - return as-is
    if (value.startsWith('data:')) {
        return value;
    }

    // Regular URL (http, https, blob, file) - return as-is
    if (value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('blob:') ||
        value.startsWith('/')) {
        return value;
    }

    // Hex-encoded bytea from PostgreSQL (starts with \x)
    // PostgreSQL stores base64 text as bytea, returns it as hex-encoded string
    if (value.startsWith('\\x')) {
        const decodedString = hexToString(value);
        if (decodedString) {
            // The decoded string is already base64
            const mimeType = detectImageMimeType(decodedString);
            return `data:${mimeType};base64,${decodedString}`;
        }
        return '';
    }

    // Clean the base64 string (remove any whitespace/newlines)
    const cleanedValue = value.replace(/\s/g, '');

    // Detect MIME type from the cleaned base64 data
    const mimeType = detectImageMimeType(cleanedValue);

    // Return as data URL with detected MIME type
    return `data:${mimeType};base64,${cleanedValue}`;
};
