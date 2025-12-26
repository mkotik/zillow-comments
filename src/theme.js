import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  breakpoints: {
    values: {
      xxs: 0, // Extra extra small devices
      xs: 440, // Small devices
      md: 900, // Medium devices
      lg: 1200, // Large devices
      xl: 1536, // Extra large devices
    },
  },

  palette: {
    mode: "dark",
    primary: { main: "#2F80FF", dark: "#155EEF" },
    error: { main: "#FF4D4D" },
    text: {
      primary: "#E5E7EB",
      secondary: "rgba(229,231,235,0.72)",
    },
    divider: "rgba(255,255,255,0.10)",
    background: {
      default: "transparent",
      paper: "rgba(17, 24, 39, 0.78)",
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    button: {
      fontWeight: 800,
      letterSpacing: 0.2,
      textTransform: "none",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: "#E5E7EB",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          backdropFilter: "blur(12px)",
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: "10px 16px",
          transition:
            "transform 150ms ease, filter 150ms ease, background 150ms ease, border-color 150ms ease",
        },

        containedPrimary: {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.00)), #2F80FF",
          boxShadow: "0 10px 26px rgba(47,128,255,0.28)",
          "&:hover": {
            filter: "brightness(1.05)",
            transform: "translateY(-1px)",
          },
          "&.Mui-disabled": {
            background: "rgba(148,163,184,0.25)",
            color: "rgba(229,231,235,0.65)",
          },
        },

        text: {
          borderRadius: 999,
          padding: "8px 14px",
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.10)",
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.10)",
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { color: "rgba(229,231,235,0.72)" },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          transform: "translateY(5px)",
          borderRadius: 14,
          backgroundColor: "rgba(17, 24, 39, 0.62)",
          // Ensure the input text sits centered vertically across browsers.
          alignItems: "center",
          "& fieldset": {
            borderColor: "rgba(255,255,255,0.14)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(47,128,255,0.55)",
          },
          "&.Mui-focused": {
            boxShadow: "0 0 0 4px rgba(47,128,255,0.18)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#2F80FF",
          },
        },
        input: {
          padding: "12px 14px",
          lineHeight: 1.2,
        },
        notchedOutline: {},
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "rgba(255,255,255,0.10)" },
      },
    },
  },
});

export default theme;
