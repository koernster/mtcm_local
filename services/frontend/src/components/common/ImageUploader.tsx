/**
 * ImageUploader Component
 * 
 * A reusable component for uploading images with configurable resolution validation.
 * Supports drag-and-drop, file selection, and preview.
 */
import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { FaUpload, FaImage, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import {
    getImageSrc,
    extractBase64FromDataUrl
} from '../../utils/imageUtils';

interface ImageUploaderProps {
    /** Current image URL or base64 string */
    value?: string;
    /** Callback when image changes */
    onChange: (imageData: string | null) => void;
    /** Maximum width in pixels */
    maxWidth?: number;
    /** Maximum height in pixels */
    maxHeight?: number;
    /** Minimum width in pixels */
    minWidth?: number;
    /** Minimum height in pixels */
    minHeight?: number;
    /** Exact width (overrides min/max width) */
    exactWidth?: number;
    /** Exact height (overrides min/max height) */
    exactHeight?: number;
    /** Maximum file size in MB */
    maxSizeMB?: number;
    /** Accepted file types */
    accept?: string;
    /** Label for the uploader */
    label?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Custom class name */
    className?: string;
}

const UploaderContainer = styled.div`
    width: 100%;
`;

const DropZone = styled.div<{ $isDragging: boolean; $hasImage: boolean; $disabled: boolean }>`
    border: 2px dashed ${({ theme, $isDragging }) =>
        $isDragging ? theme.primary : theme.border};
    border-radius: ${({ theme }) => theme.borderRadius || '8px'};
    padding: ${({ $hasImage }) => $hasImage ? '0.5rem' : '2rem'};
    text-align: center;
    cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    background: ${({ theme, $isDragging }) =>
        $isDragging ? theme.hoverLight : theme.background};
    opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};

    &:hover {
        border-color: ${({ theme, $disabled }) =>
        $disabled ? theme.border : theme.primary};
        background: ${({ theme, $disabled }) =>
        $disabled ? theme.background : theme.hoverLight};
    }
`;

const UploadIcon = styled.div`
    color: ${({ theme }) => theme.textMuted};
    margin-bottom: 0.5rem;
`;

const UploadText = styled.p`
    color: ${({ theme }) => theme.textMuted};
    margin: 0;
    font-size: 0.9rem;
`;

const UploadSubText = styled.p`
    color: ${({ theme }) => theme.textMuted};
    margin: 0.25rem 0 0 0;
    font-size: 0.75rem;
    opacity: 0.8;
`;

const PreviewContainer = styled.div`
    position: relative;
    display: inline-block;
    max-width: 100%;
`;

const PreviewImage = styled.img`
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
    object-fit: contain;
`;

const RemoveButton = styled.button`
    position: absolute;
    top: -8px;
    right: -8px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.1);
    }
`;

const ErrorMessage = styled.div`
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const ResolutionInfo = styled.div`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.textMuted};
    margin-top: 0.25rem;
`;

const HiddenInput = styled.input`
    display: none;
`;

const ImageUploader: React.FC<ImageUploaderProps> = ({
    value,
    onChange,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    exactWidth,
    exactHeight,
    maxSizeMB = 5,
    accept = 'image/png,image/jpeg,image/jpg,image/gif,image/webp',
    label,
    placeholder = 'Click or drag image to upload',
    disabled = false,
    className
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getResolutionText = useCallback(() => {
        if (exactWidth && exactHeight) {
            return `Required: ${exactWidth}×${exactHeight}px`;
        }

        const parts: string[] = [];
        if (minWidth || minHeight) {
            parts.push(`Min: ${minWidth || 'any'}×${minHeight || 'any'}px`);
        }
        if (maxWidth || maxHeight) {
            parts.push(`Max: ${maxWidth || 'any'}×${maxHeight || 'any'}px`);
        }

        return parts.length > 0 ? parts.join(' | ') : null;
    }, [exactWidth, exactHeight, minWidth, minHeight, maxWidth, maxHeight]);

    const validateImage = useCallback((file: File): Promise<{ valid: boolean; error?: string; dataUrl: string }> => {
        return new Promise((resolve) => {
            // Check file size
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
                resolve({ valid: false, error: `File size exceeds ${maxSizeMB}MB limit`, dataUrl: '' });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const img = new Image();

                img.onload = () => {
                    const { width, height } = img;

                    // Check exact dimensions
                    if (exactWidth && width !== exactWidth) {
                        resolve({ valid: false, error: `Image width must be exactly ${exactWidth}px (got ${width}px)`, dataUrl });
                        return;
                    }
                    if (exactHeight && height !== exactHeight) {
                        resolve({ valid: false, error: `Image height must be exactly ${exactHeight}px (got ${height}px)`, dataUrl });
                        return;
                    }

                    // Check min dimensions
                    if (minWidth && width < minWidth) {
                        resolve({ valid: false, error: `Image width must be at least ${minWidth}px (got ${width}px)`, dataUrl });
                        return;
                    }
                    if (minHeight && height < minHeight) {
                        resolve({ valid: false, error: `Image height must be at least ${minHeight}px (got ${height}px)`, dataUrl });
                        return;
                    }

                    // Check max dimensions
                    if (maxWidth && width > maxWidth) {
                        resolve({ valid: false, error: `Image width must be at most ${maxWidth}px (got ${width}px)`, dataUrl });
                        return;
                    }
                    if (maxHeight && height > maxHeight) {
                        resolve({ valid: false, error: `Image height must be at most ${maxHeight}px (got ${height}px)`, dataUrl });
                        return;
                    }

                    resolve({ valid: true, dataUrl });
                };

                img.onerror = () => {
                    resolve({ valid: false, error: 'Invalid image file', dataUrl: '' });
                };

                img.src = dataUrl;
            };

            reader.onerror = () => {
                resolve({ valid: false, error: 'Failed to read file', dataUrl: '' });
            };

            reader.readAsDataURL(file);
        });
    }, [maxSizeMB, exactWidth, exactHeight, minWidth, minHeight, maxWidth, maxHeight]);

    const handleFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        setError(null);
        const result = await validateImage(file);

        if (!result.valid) {
            setError(result.error || 'Invalid image');
            return;
        }

        // Extract pure base64 from data URL and pass to onChange
        const pureBase64 = extractBase64FromDataUrl(result.dataUrl);
        onChange(pureBase64);
    }, [validateImage, onChange]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [disabled, handleFile]);

    const handleClick = useCallback(() => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [disabled]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
        // Reset input value so same file can be selected again
        e.target.value = '';
    }, [handleFile]);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setError(null);
        onChange(null);
    }, [onChange]);

    const resolutionText = getResolutionText();

    return (
        <UploaderContainer className={className}>
            {label && <label style={{ marginBottom: '0.5rem', display: 'block' }}>{label}</label>}

            <DropZone
                $isDragging={isDragging}
                $hasImage={!!value}
                $disabled={disabled}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {value && getImageSrc(value) ? (
                    <PreviewContainer>
                        <PreviewImage src={getImageSrc(value)} alt="Preview" />
                        {!disabled && (
                            <RemoveButton onClick={handleRemove} title="Remove image">
                                <FaTimes />
                            </RemoveButton>
                        )}
                    </PreviewContainer>
                ) : (
                    <>
                        <UploadIcon>
                            <FaImage size={32} />
                        </UploadIcon>
                        <UploadText>{placeholder}</UploadText>
                        <UploadSubText>
                            Supports: PNG, JPG, GIF, WebP (max {maxSizeMB}MB)
                        </UploadSubText>
                        {resolutionText && (
                            <ResolutionInfo>{resolutionText}</ResolutionInfo>
                        )}
                    </>
                )}
            </DropZone>

            <HiddenInput
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleInputChange}
                disabled={disabled}
            />

            {error && (
                <ErrorMessage>
                    <FaExclamationTriangle />
                    {error}
                </ErrorMessage>
            )}
        </UploaderContainer>
    );
};

export default ImageUploader;
