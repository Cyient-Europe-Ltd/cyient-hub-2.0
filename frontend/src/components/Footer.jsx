import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color= "#FFFFFF"
      align="center"
      {...props}
    >
        &copy; {new Date().getFullYear()} CYIENT Europe Ltd | All Rights
        Reserved.
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function StickyFooter() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '10vh',
        }}
      >
        <CssBaseline />
        <Box
          component="footer"
          sx={{
            py: -3,
            px: 2,
            mt: 'auto',
            backgroundColor: '#08a4dc',
          }}
        >
          <Container maxWidth="sm">
            <Copyright sx={{ mt: 8, mb: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}