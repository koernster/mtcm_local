import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Container, Row, Col } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';

interface SkeletonProps {
    count?: number;
    height?: number[];
    width?: string[];
    rows?: number;
}

const SkeletonLoading: React.FC<SkeletonProps> = ({
    count = 1,
    height = [25],
    width = ['100%'],
    rows = 1,
}) => {
    const { theme } = useTheme();
    const skeletonRows = Array(rows).fill(null);

    return (
        <SkeletonTheme
            baseColor={theme.skeletonBackground || theme.background}
            highlightColor={theme.hover}
            borderRadius={'4px'}
        >
            <style>
                {`
                    @keyframes shimmer {
                        0% {
                            background-position: -100% 0;
                        }
                        100% {
                            background-position: 100% 0;
                        }
                    }

                    .react-loading-skeleton {
                        background: ${theme.skeletonBackground || theme.background};
                        margin: ${theme.spacing?.xs || '4px'} 0;
                        opacity: 0.8;
                        background-size: 200% 100%;
                        animation: shimmer 2s infinite ease-in-out;
                    }
                    .skeleton-container {
                        padding: ${theme.spacing?.sm || '8px'};
                    }
                    .skeleton-row {
                        margin-bottom: ${theme.spacing?.xs || '4px'};
                    }
                `}
            </style>
            <Container className="skeleton-container" fluid>
                {skeletonRows.map((_, index) => (
                    <Row key={index} className="skeleton-row">
                        <Col>
                            <Skeleton
                                count={count}
                                height={height[index]}
                                width={width[index] ?? '100%'}
                            />
                        </Col>
                    </Row>
                ))}
            </Container>
        </SkeletonTheme>
    );
};

export default SkeletonLoading;
