// src/theme.ts
'use client';
import { Roboto,  } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  palette:{
    primary: {
      main: '#F0F0F0'
    }
  },
  typography: {
    fontFamily: `Munro, ${roboto.style.fontFamily}, sans-serif`,
  },
  components:{
    MuiTypography:{
      styleOverrides:{
        root:{
          color: 'white'
        },
        h1:{
          fontWeight:'bold',
          fontSize: 90
        },
        h2:{
          fontWeight:'bold',
          fontSize: 40
        },
        h3:{
          fontWeight:'bold',
          fontSize: 30
        },
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform:'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          paddingLeft: 50,
          paddingRight: 50,
        }
      }
    }
  }
});

export default theme;
