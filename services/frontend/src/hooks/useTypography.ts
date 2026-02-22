import { useTheme } from '../context/ThemeContext';

/**
 * Hook to access typography values from the theme
 * Useful for dynamic styling or when styled-components aren't suitable
 */
export const useTypography = () => {
  const { theme } = useTheme();
  
  return {
    fontSize: theme.typography.fontSize,
    fontWeight: theme.typography.fontWeight,
    lineHeight: theme.typography.lineHeight,
    letterSpacing: theme.typography.letterSpacing,
    
    // Helper functions for common combinations
    getHeadingStyle: (level: 1 | 2 | 3 | 4 | 5 | 6) => {
      const sizes = {
        1: theme.typography.fontSize['4xl'],
        2: theme.typography.fontSize['3xl'],
        3: theme.typography.fontSize['2xl'],
        4: theme.typography.fontSize.xl,
        5: theme.typography.fontSize.lg,
        6: theme.typography.fontSize.md,
      };
      
      return {
        fontSize: sizes[level],
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.lineHeight.tight,
        color: theme.text,
      };
    },
    
    getBodyStyle: (size: keyof typeof theme.typography.fontSize = 'base') => ({
      fontSize: theme.typography.fontSize[size],
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.normal,
      color: theme.text,
    }),
    
    getMutedStyle: (size: keyof typeof theme.typography.fontSize = 'sm') => ({
      fontSize: theme.typography.fontSize[size],
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight.normal,
      color: theme.textMuted,
    }),
    
    getLabelStyle: () => ({
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight.normal,
      color: theme.text,
    }),
  };
};
