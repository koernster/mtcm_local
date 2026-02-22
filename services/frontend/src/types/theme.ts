export interface Theme {
  navbarBackground: string;
  skeletonBackground: string;
  selectValueBackground: string;
  background: string;
  text: string;
  textMuted: string;
  default: string;
  defaultHover: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  success: string;
  successHover: string;
  warning: string;
  warningHover: string;
  hover: string;
  hoverLight: string;
  border: string;
  borderRadius: string;
  padding: string;
  spacing: {
    xxs: string;   // 2px
    xs: string;    // 4px
    sm: string;    // 8px
    md: string;    // 16px
    lg: string;    // 24px
    xl: string;    // 32px
    xxl: string;   // 48px
  };
  typography: {
    // Font sizes
    fontSize: {
      xs: string;      // 0.75rem (12px)
      sm: string;      // 0.85rem (13.6px) 
      base: string;    // 0.9rem (14.4px)
      md: string;      // 1rem (16px)
      lg: string;      // 1.125rem (18px)
      xl: string;      // 1.25rem (20px)
      '2xl': string;   // 1.5rem (24px)
      '3xl': string;   // 1.875rem (30px)
      '4xl': string;   // 2.25rem (36px)
    };
    // Font weights
    fontWeight: {
      normal: string;  // 400
      medium: string;  // 500
      semibold: string; // 600
      bold: string;    // 700
    };
    // Line heights
    lineHeight: {
      tight: string;   // 1.2
      normal: string;  // 1.4
      relaxed: string; // 1.6
    };
    // Letter spacing
    letterSpacing: {
      tight: string;   // -0.025em
      normal: string;  // 0em
      wide: string;    // 0.025em
    };
  };
}
