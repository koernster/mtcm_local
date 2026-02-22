import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { Theme } from '../types/theme';

export const themes: Record<'dark' | 'light', Theme> = {
  // dark: {
  //   navbarBackground: 'linear-gradient(90deg, #2c3338 0%, #343a40 100%)',
  //   skeletonBackground: 'linear-gradient(110deg, #1a1d20 30%, #2c3338 50%, #1a1d20 70%)',
  //   selectValueBackground: 'linear-gradient(80deg, rgba(28,28,28,1) -50%, rgba(52,58,64,1) 70%)',    background: '#2c3338',
  //   text: '#f8f9fa',
  //   textMuted: '#9ea6ad',    
  //   default: '#64748b',     // New default color
  //   defaultHover: '#475569', // New default hover color
  //   primary: '#60a5fa',   // Lighter modern blue
  //   primaryHover: '#3b82f6',
  //   secondary: '#94a3b8', // Lighter slate gray
  //   secondaryHover: '#64748b',
  //   success: '#4ade80',   // Lighter vibrant green
  //   successHover: '#22c55e',
  //   warning: '#fbbf24',   // Lighter amber color
  //   warningHover: '#f59e0b',
  //   hover: '#4a545c',
  //   hoverLight: '#545c64',
  //   border: '#545c64',
  //   borderRadius: '10px',
  //   padding: '5px 15px',
  //   spacing: {
  //     xxs: '2px',
  //     xs: '4px',
  //     sm: '8px',
  //     md: '16px',
  //     lg: '24px',
  //     xl: '32px',
  //     xxl: '48px',
  //   }
  // },
  dark: {
    navbarBackground: 'linear-gradient(90deg, #0D1B2A 0%, #1B263B 100%)', // Navy to Darkest Blue
    skeletonBackground: 'linear-gradient(110deg, #0D1B2A 30%, #1B263B 50%, #0D1B2A 70%)', // Subtle shimmer
    selectValueBackground: 'linear-gradient(80deg, #0D1B2A -50%, #1B263B 70%)',
    background: '#0D1B2A', // Darkest Blue
    text: '#E0E1DD', // Light Gray
    textMuted: '#778DA9', // Light Blue-Gray
    default: '#415A77', // Blue-Gray
    defaultHover: '#1B263B', // Deep hover contrast
    primary: '#778DA9', // Light Blue-Gray
    primaryHover: '#415A77', // Subtle blue-gray hover
    secondary: '#E0E1DD', // Light Gray for highlights or alt text
    secondaryHover: '#778DA9',
    success: '#4ade80', // Keeping vibrant green
    successHover: '#22c55e',
    warning: '#fbbf24',
    warningHover: '#f59e0b',
    hover: '#1B263B',
    hoverLight: '#415A77',
    border: '#415A77',
    borderRadius: '10px',
    padding: '5px 15px',
    spacing: {
      xxs: '2px',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px',
    },
    typography: {
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.85rem',    // 13.6px
        base: '0.9rem',   // 14.4px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.2',
        normal: '1.4',
        relaxed: '1.6',
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
      },
    }
  },
  // dark: {
  //   navbarBackground: 'linear-gradient(90deg, #1e1e1e 0%, #2d2d30 50%, #3c3c3c 100%)',
  //   skeletonBackground: 'linear-gradient(110deg, #1e1e1e 30%, #2d2d30 50%, #1e1e1e 70%)',
  //   selectValueBackground: 'linear-gradient(80deg, #252526 -50%, #3c3c3c 70%)',
  //   background: '#1e1e1e',      // Editor background
  //   text: '#d4d4d4',            // Default foreground
  //   textMuted: '#808080',       // Muted text (comments, placeholders)
  //   default: '#3c3c3c',         // Panel background
  //   defaultHover: '#444444',    // Slightly lighter hover
  //   primary: '#007acc',         // VS Code blue (activity bar, highlights)
  //   primaryHover: '#006bb3',
  //   secondary: '#2d2d30',       // Sidebar background
  //   secondaryHover: '#3c3c3c',
  //   success: '#4ade80',
  //   successHover: '#22c55e',
  //   warning: '#fbbf24',
  //   warningHover: '#f59e0b',
  //   hover: '#2a2d2e',
  //   hoverLight: '#3c3c3c',
  //   border: '#3c3c3c',
  //   borderRadius: '10px',
  //   padding: '5px 15px',
  //   spacing: {
  //     xxs: '2px',
  //     xs: '4px',
  //     sm: '8px',
  //     md: '16px',
  //     lg: '24px',
  //     xl: '32px',
  //     xxl: '48px',
  //   }
  // },
  // light: {
  //   navbarBackground: 'linear-gradient(90deg, #f8f9fa 0%, #eef0f2 100%)',
  //   skeletonBackground: 'linear-gradient(110deg, #e6e9ec 30%, #eef0f2 50%, #e6e9ec 70%)',
  //   selectValueBackground: 'linear-gradient(80deg, rgba(52,58,64,1) -50%, rgba(238,240,242,1) 70%)', background: '#eef0f2',
  //   text: '#313942',
  //   textMuted: '#636c76',
  //   default: '#4b5563',     // New default color
  //   defaultHover: '#374151', // New default hover color
  //   primary: '#3b82f6',   // Lighter professional blue
  //   primaryHover: '#2563eb',
  //   secondary: '#64748b', // Lighter balanced gray
  //   secondaryHover: '#4b5563',
  //   success: '#22c55e',   // Lighter professional green
  //   successHover: '#16a34a',
  //   warning: '#f59e0b',   // Lighter amber
  //   warningHover: '#d97706',
  //   hover: '#f1f5f9',
  //   hoverLight: '#f1f5f9',
  //   border: '#cfd4da',
  //   borderRadius: '10px',
  //   padding: '5px 15px',
  //   spacing: {
  //     xxs: '2px',
  //     xs: '4px',
  //     sm: '8px',
  //     md: '16px',
  //     lg: '24px',
  //     xl: '32px',
  //     xxl: '48px',
  //   }
  // }
  light: {
    navbarBackground: 'linear-gradient(90deg, #778DA9 0%, #B7BDC8 40%, #E0E1DD 100%)', // Light Gray to Light Blue-Gray
    skeletonBackground: 'linear-gradient(110deg, #E0E1DD 30%, #778DA9 50%, #E0E1DD 70%)',
    selectValueBackground: 'linear-gradient(80deg, #778DA9 -50%, #E0E1DD 70%)',
    background: '#E0E1DD', // Light Gray
    text: '#0D1B2A', // Darkest Blue for strong readability
    textMuted: '#415A77', // Blue-Gray for subtler text
    default: '#415A77', // Blue-Gray
    defaultHover: '#1B263B', // Navy Hover
    primary: '#1B263B', // Navy for interactive elements
    primaryHover: '#0D1B2A', // Slightly deeper hover
    secondary: '#778DA9', // Light Blue-Gray for secondary buttons
    secondaryHover: '#415A77',
    success: '#22c55e',
    successHover: '#16a34a',
    warning: '#f59e0b',
    warningHover: '#d97706',
    hover: '#D9DEE4', // A touch darker than background
    hoverLight: '#EFF1F4',
    border: '#C5CAD3',
    borderRadius: '10px',
    padding: '5px 15px',
    spacing: {
      xxs: '2px',
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px',
    },
    typography: {
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.85rem',    // 13.6px
        base: '0.9rem',   // 14.4px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.2',
        normal: '1.4',
        relaxed: '1.6',
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
      },
    }
  }
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: string) => void;
};

const getSystemTheme = (): 'dark' | 'light' => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState(themes.dark);

  useEffect(() => {
    function getCookie(name: string) {
      if (typeof document === 'undefined') return null;
      const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return m ? decodeURIComponent(m.pop() as string) : null;
    }

    const cookieTheme = getCookie('mtcm_theme');
    const storedTheme = (() => {
      try { return localStorage.getItem('theme'); } catch (e) { return null; }
    })();
    const candidate = cookieTheme || storedTheme;
    if (candidate) {
      if (candidate === 'dark' || candidate === 'light') {
        setThemeState(themes[candidate]);
        return;
      }
    }

    setThemeState(themes[getSystemTheme()]);
  }, []);

  const setTheme = (theme: string) => {
    const finalTheme = (theme === 'dark' || theme === 'light') ? theme : getSystemTheme();
    setThemeState(themes[finalTheme]);

    try {
      localStorage.setItem('theme', finalTheme);
    } catch (e) {
      // ignore localStorage errors
    }

    // persist cross-subdomain cookie when possible
    try {
      const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : '';
      let cookieDomain = '';
      // do not set domain for localhost or IP addresses
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || /^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(hostname);
      if (!isLocalhost && hostname) {
        const parts = hostname.split('.');
        cookieDomain = parts.length > 2 ? `.${parts.slice(-2).join('.')}` : `.${hostname}`;
      }

      const maxAge = 60 * 60 * 24 * 365; // 1 year
      let cookie = `mtcm_theme=${encodeURIComponent(finalTheme)};path=/;max-age=${maxAge}`;
      if (cookieDomain) {
        cookie += `;domain=${cookieDomain};SameSite=None;Secure`;
      }
      document.cookie = cookie;
    } catch (e) {
      // ignore cookie set failures
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};
