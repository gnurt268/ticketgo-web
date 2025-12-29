import { createTheme } from '@mui/material/styles';

// TicketGo Color Palette - Based on Logo
const colors = {
  primary: {
    main: '#5E35B1',
    light: '#7C3AED',
    dark: '#4527A0',
    lighter: '#EDE7F6',
  },
  secondary: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  background: {
    default: '#F8F5FF',
    paper: '#FFFFFF',
    accent: '#F3F0FF',
  },
  text: {
    primary: '#1E1B4B',
    secondary: '#6B7280',
  },
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      lighter: colors.primary.lighter,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    success: {
      main: '#10B981',
      light: '#D1FAE5',
      lighter: '#ECFDF5',
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2',
      lighter: '#FEF2F2',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      lighter: '#FFFBEB',
    },
    info: {
      main: '#7C3AED',
      light: '#EDE9FE',
      lighter: '#F5F3FF',
    },
    // Custom colors for easy access
    ticketgo: {
      purple: colors.primary.main,
      purpleLight: colors.primary.light,
      orange: colors.secondary.main,
      bgLight: colors.background.accent,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: colors.text.primary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: colors.text.primary,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: colors.text.primary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(94, 53, 177, 0.3)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.light} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.secondary.dark} 0%, ${colors.secondary.main} 100%)`,
          },
        },
        outlinedPrimary: {
          borderColor: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.primary.lighter,
            borderColor: colors.primary.main,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(94, 53, 177, 0.08)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(94, 53, 177, 0.12)',
          },
          transition: 'box-shadow 0.3s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: colors.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: colors.primary.lighter,
          color: colors.primary.main,
        },
        colorSecondary: {
          backgroundColor: '#FEF3C7',
          color: colors.secondary.dark,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: colors.text.primary,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          '&.Mui-selected': {
            color: colors.primary.main,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: colors.primary.main,
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary.main,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: '#D1FAE5',
          color: '#065F46',
        },
        standardError: {
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
        },
        standardWarning: {
          backgroundColor: '#FEF3C7',
          color: '#92400E',
        },
        standardInfo: {
          backgroundColor: '#EDE9FE',
          color: colors.primary.dark,
        },
      },
    },
  },
});

export default theme;