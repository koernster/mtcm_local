import React, { useState } from 'react';
import { Col, Collapse, Fade } from 'react-bootstrap';
import { TopButton, VerticalBar, VerticalText } from '../styled/CommonStyled';
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6';
import { useTheme } from '../../context/ThemeContext';


interface VerticleCollapsContainerProps {
    sm: number;
    md: number;
    xs: number;
    titleText: string;
    children: React.ReactNode;
    onCollapse?: (collapsed: boolean) => void;
}

const VerticleCollapsContainer: React.FC<VerticleCollapsContainerProps> = (props: VerticleCollapsContainerProps) => {
    const { theme } = useTheme();
    const [collapsed, setCollapsed] = useState(false);

    const handleCollapse = (newCollapsed: boolean) => {
        setCollapsed(newCollapsed);
        props.onCollapse?.(newCollapsed);
    };

    return (<>
        {collapsed ? (
            <Fade in={collapsed}>
                <Col 
                    sm={1} 
                    md={1} 
                    onClick={() => { handleCollapse(!collapsed) }} 
                    className="position-relative vertical-collapse-container collapsed" 
                    style={{ 
                        width: 'fit-content', 
                        paddingLeft: '1rem', 
                        paddingRight: '1rem', 
                        borderRight: `solid 1px ${theme.border}`, 
                        background: theme.hover, 
                        cursor: 'pointer',
                        minHeight: '100vh'
                    }}
                >
                    <TopButton>
                        <FaAnglesRight size={13} />
                    </TopButton>
                    <VerticalText>
                        {props.titleText}
                    </VerticalText>
                </Col>
            </Fade>
        ) : (
            <Collapse in={!collapsed} dimension="width">
                <VerticalBar sm={3} autoWidth={false} className="vertical-collapse-container">
                <Col sm={12} md={12} className="p-1" style={{ background: theme.hover }}>
                    <small style={{ color: theme.text, fontWeight: 'bolder' }}>{props.titleText}</small>
                    <div className='float-end'>
                        <div onClick={() => { handleCollapse(!collapsed) }}>
                            <FaAnglesLeft size={13} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>
                </Col>
                {props.children}
            </VerticalBar>
        </Collapse>)}
    </>);
}

export default VerticleCollapsContainer;