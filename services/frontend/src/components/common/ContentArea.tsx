import React, { useRef } from "react";
import { Col } from "react-bootstrap";
import styled from "styled-components";
import { Heading, Paragraph } from "../styled/TypographyStyled";
import { useAdjacentCollapse } from "../../hooks/useAdjacentCollapse";

// You can't directly get the Bootstrap Navbar height from JS/TS at build time.
const HEADER_HEIGHT = "64px"; // Adjust this value to match your Navbar's height

const StyledContentArea = styled(Col)`
    background-color: ${({ theme }) => theme.background};
    min-height: 0; // Allow content to shrink
    height: 91vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const StyledHeaderArea = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.75rem 0;
`;

const StyledHeadingGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const StyledToolButtons = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding-top: 0.25rem;
`;

const StyledBody = styled.div`
    flex: 1;
    min-height: 0; // Important for nested flex scroll
    overflow-y: auto;
    display: flex;
    flex-direction: column;
`;

interface ContentAreaProps {
    header?: string;
    subHeader?: string;
    body: React.ReactNode;
    toolButtons?: React.ReactNode;
}

const ContentArea: React.FC<ContentAreaProps & React.ComponentProps<typeof Col>> = ({
    header,
    subHeader,
    body,
    toolButtons,
    sm: initialSm = 9,
    md: initialMd = 9,
    ...colProps
}) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const adjustedColumns = useAdjacentCollapse(contentRef);
    
    // Convert string values to numbers and provide fallbacks
    const baseSm = Number(initialSm) || 9;
    const baseMd = Number(initialMd) || 9;
    
    // Calculate final columns with safety checks
    const finalSm = Math.min(11, baseSm + adjustedColumns);
    const finalMd = Math.min(11, baseMd + adjustedColumns);

    return (
        <StyledContentArea 
            ref={contentRef}
            sm={finalSm}
            md={finalMd}
            className="flex-grow-1"
            {...colProps}>
            {(header || toolButtons) && (
                <StyledHeaderArea>
                    <StyledHeadingGroup>
                        {header && <Heading level={4} style={{ margin: 0 }}>{header}</Heading>}
                        {subHeader && <Paragraph color="textMuted" style={{ margin: 0 }}>{subHeader}</Paragraph>}
                    </StyledHeadingGroup>
                    {toolButtons && <StyledToolButtons>{toolButtons}</StyledToolButtons>}
                </StyledHeaderArea>
            )}
            <StyledBody>
                {body}
            </StyledBody>
        </StyledContentArea>
    );
};

export default ContentArea;