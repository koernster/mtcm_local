import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Notification } from '../../services/api/graphQL/notifications/types/notifications';
import { Paragraph } from '../styled/TypographyStyled';
import { useTheme } from '../../context/ThemeContext';

interface NoticationsDetailedViewProps {
    notification: Notification
}

const NoticationsDetail: React.FC<NoticationsDetailedViewProps> = ({ notification }) => {
    const {theme} = useTheme();
    return <div>
        <Row>
            <Col sm={12} md={12} lg={12}>
                <div 
                    style={{
                        border: `1px solid ${ theme.border }`, 
                        borderRadius: `${ theme.borderRadius }`,
                        color: theme.text,
                        padding: '12px',
                    }}
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                ></div>
            </Col>
        </Row>
    </div>;
}

export default NoticationsDetail;