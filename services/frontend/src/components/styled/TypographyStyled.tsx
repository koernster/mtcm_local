import styled from 'styled-components';
import { Theme } from '../../types/theme';

// Text component with typography system
export const Text = styled.span<{
  size?: keyof Theme['typography']['fontSize'];
  weight?: keyof Theme['typography']['fontWeight'];
  color?: 'text' | 'textMuted' | 'primary' | 'secondary' | 'success' | 'warning';
  lineHeight?: keyof Theme['typography']['lineHeight'];
  letterSpacing?: keyof Theme['typography']['letterSpacing'];
  as?: React.ElementType;
}>`
  font-size: ${({ theme, size = 'base' }) => theme.typography.fontSize[size]};
  font-weight: ${({ theme, weight = 'normal' }) => theme.typography.fontWeight[weight]};
  color: ${({ theme, color = 'text' }) => theme[color]};
  line-height: ${({ theme, lineHeight = 'normal' }) => theme.typography.lineHeight[lineHeight]};
  letter-spacing: ${({ theme, letterSpacing = 'normal' }) => theme.typography.letterSpacing[letterSpacing]};
  margin: 0;
  padding: 0;
`;

// Heading component
export const Heading = styled(Text).attrs({ as: 'h1' })<{
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}>`
  font-weight: ${({ theme, weight = 'semibold' }) => theme.typography.fontWeight[weight]};
  font-size: ${({ theme, level = 1, size }) => {
    if (size) return theme.typography.fontSize[size];
    
    const levelSizes = {
      1: theme.typography.fontSize['4xl'],
      2: theme.typography.fontSize['3xl'],
      3: theme.typography.fontSize['2xl'],
      4: theme.typography.fontSize.xl,
      5: theme.typography.fontSize.lg,
      6: theme.typography.fontSize.md,
    };
    
    return levelSizes[level];
  }};
  line-height: ${({ theme, lineHeight = 'tight' }) => theme.typography.lineHeight[lineHeight]};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

// Styled headings
export const H1 = styled(Heading).attrs({ as: 'h1', level: 1 })``;
export const H2 = styled(Heading).attrs({ as: 'h2', level: 2 })``;
export const H3 = styled(Heading).attrs({ as: 'h3', level: 3 })``;
export const H4 = styled(Heading).attrs({ as: 'h4', level: 4 })``;
export const H5 = styled(Heading).attrs({ as: 'h5', level: 5 })``;
export const H6 = styled(Heading).attrs({ as: 'h6', level: 6 })``;

// Paragraph
export const Paragraph = styled(Text).attrs({ as: 'p' })`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: ${({ theme, lineHeight = 'relaxed' }) => theme.typography.lineHeight[lineHeight]};
`;

// Small text
export const Small = styled(Text).attrs({ size: 'sm', color: 'textMuted' })``;

// Label
export const Label = styled(Text).attrs({ 
  as: 'label', 
  size: 'sm',
  weight: 'medium',
  color: 'text'
})`
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

// Caption
export const Caption = styled(Text).attrs({ 
  size: 'xs',
  color: 'textMuted',
  lineHeight: 'normal'
})``;

// Lead text
export const Lead = styled(Text).attrs({ 
  as: 'p',
  size: 'lg',
  lineHeight: 'relaxed'
})`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

// Code text
export const Code = styled(Text).attrs({ as: 'code' })`
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  background-color: ${({ theme }) => theme.hover};
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.xs}`};
  border-radius: 4px;
  font-size: 0.875em;
`;
