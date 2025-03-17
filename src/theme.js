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
});

export default theme;
