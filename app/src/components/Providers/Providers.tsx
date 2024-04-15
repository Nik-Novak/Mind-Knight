import theme from "@/features/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { NotificationProvider } from "../NotificationQueue";
import EventNotifications from "../EventNotifications";
import { ServerEventsProvider } from "../ServerEventsProvider";
import { MindnightSessionProvider } from "../MindnightSessionProvider";
import { SettingsProvider } from "../SettingsProvider";
// import { SessionProvider } from 'next-auth/react' //Guess this cant be 

type Props = {
  children: React.ReactNode
}

export default function Providers({children}:Props){
  return (
  <AppRouterCacheProvider>
    {/* <SessionProvider> Guess this cant be used here since it converts all children to client components */}
    <ServerEventsProvider>
      <SettingsProvider>
        <MindnightSessionProvider>
          <NotificationProvider>
            <ThemeProvider theme={theme}>
              <EventNotifications />
              {children}
            </ThemeProvider>
          </NotificationProvider>
        </MindnightSessionProvider>
      </SettingsProvider>
    </ServerEventsProvider>
    {/* </SessionProvider> */}
  </AppRouterCacheProvider>
  );
}