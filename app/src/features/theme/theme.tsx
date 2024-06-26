// src/theme.ts
'use client';
import { Roboto,  } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

declare module "@mui/material/styles" {
  interface Palette {
    custom: {
      secured: string,
      securedDark: string,
      hacked: string,
      hackedDark: string,
    };
  }
  interface PaletteOptions {
    custom?: {
      secured: string,
      securedDark: string,
      hacked: string,
      hackedDark: string,
    };
  }
}

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  palette:{
    text:{
      secondary: '#FFFFFF',
      primary: '#FFFFFF'
    },
    primary: {
      main: '#F0F0F0'
    },
    secondary: {
      main: '#F0F0F0'
    },
    action:{ //icon buttons, etc.
      active: '#F0F0F0',
    },
    custom:{
      secured: '#25A165',
      securedDark: '#159155',
      hacked: '#952C30',
      hackedDark: '#851C20',
    }
  },
  typography: {
    fontFamily: `Munro, ${roboto.style.fontFamily}, sans-serif`,
    allVariants:{
      // fontFamily: `Munro, ${roboto.style.fontFamily}, sans-serif`,
      color: '#FFF'
      // lineHeight: 1
    }
  },
  components:{
    //@ts-expect-error
    MuiDataGrid:{
      styleOverrides:{
        root:{
          backgroundColor: '#2F2E2C',
          // '& .MuiPaper-root':{
          //   backgroundColor: '#2F2E2C'
          // }
        },
        columnHeader: {
          backgroundColor: '#222222'
        }
      }
    },
    MuiDialogTitle:{
      styleOverrides:{
        root:{
          backgroundColor: '#222222'
        }
      }
    },
    MuiDialogContent:{
      styleOverrides:{
        root:{
          paddingTop: '20px !important'
        }
      }
    },
    MuiTypography:{
      styleOverrides:{
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
      defaultProps:{
        className:'pixel-corners',
        variant: 'contained'
      },
      styleOverrides: {
        root: {
          textTransform:'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          "&.Mui-disabled": {
            backgroundColor: "#444"
          }
        },
      },
    },
    MuiCheckbox:{
      styleOverrides:{
        root:{
          color:'white'
        }
      }
    },
    MuiAccordion: {
      styleOverrides:{
        root: {
          backgroundColor: '#444',
          // color: 'white'
        }
      }
    },
    MuiPaper: {
      styleOverrides:{
        root:{
          backgroundColor:'#2F2E2C'
        }
      }
    }
  }
});

export default theme;
