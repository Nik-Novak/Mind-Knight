import theme from "@/features/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
// import { SessionProvider } from 'next-auth/react' //Guess this cant be 

type Props = {
  children: React.ReactNode
}

export default function Providers({children}:Props){
  return (
  <AppRouterCacheProvider>
      {/* <SessionProvider> Guess this cant be used here since it converts all children to client components */}
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      {/* </SessionProvider> */}
  </AppRouterCacheProvider>
  );
}