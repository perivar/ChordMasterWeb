import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";

import { themeSessionResolver } from "./theme.sessions.server";

import "./tailwind.css";

import { useEffect } from "react";

import ConfirmProvider from "./components/layout/confirm-provider";
import LoadingIndicator from "./components/LoadingIndicator";
import ResponsiveNavBar from "./components/ResponsiveNavBar";
import { Toaster } from "./components/ui/toaster";
import { AppProvider, IUserRecord } from "./context/AppContext";
import { isSessionValid } from "./fb.sessions.server";
import useFirestoreMethods from "./hooks/useFirestoreMethods";

// https://gist.github.com/keepforever/43c5cfa72cad8b1dad2f3982fe81b576?permalink_comment_id=5117253#gistcomment-5117253

// Return the theme and the session from the session storage using the loader
export async function loader({ request }: LoaderFunctionArgs) {
  // get theme
  const { getTheme } = await themeSessionResolver(request);

  // check if we are authenticated, and if we are, return the claims and the user
  const userSession = await isSessionValid(request);
  let decodedClaims;
  let user: IUserRecord = {
    uid: undefined,
    displayName: undefined,
    email: undefined,
    avatar: undefined,
  };
  if (userSession?.success) {
    decodedClaims = userSession?.decodedClaims;
    user = {
      uid: userSession.user?.uid,
      email: userSession.user?.email,
      displayName:
        userSession.user?.providerData[0]?.displayName ??
        userSession.user?.displayName,
      avatar:
        userSession.user?.providerData[0]?.photoURL ??
        userSession.user?.photoURL,
    };
  }

  return { theme: getTheme(), decodedClaims, user };
}

// It defines the overall page structure (header, footer, etc.) and renders children
export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");

  return (
    <ThemeProvider
      specifiedTheme={data?.theme ?? null}
      themeAction="/action/set-theme">
      <AppProvider user={data?.user}>
        <ConfirmProvider>
          <InnerLayout ssrTheme={Boolean(data?.theme)}>{children}</InnerLayout>
        </ConfirmProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

// In order to avoid the Error: useTheme must be used within a ThemeProvider
function InnerLayout({
  ssrTheme,
  children,
}: {
  ssrTheme: boolean;
  children: React.ReactNode;
}) {
  const [theme] = useTheme();

  return (
    <html lang="en" data-theme={theme} className={theme ?? ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={ssrTheme} />
        <Links />
      </head>
      <body>
        <ResponsiveNavBar />
        {/* children will be the root Component, ErrorBoundary, or HydrateFallback */}
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<typeof loader>("root");

  // In order to avoid the Error: useAppContext must be used within a AppProvider
  const {
    // loadAppConfigData,
    loadUserAppConfigData,
    loadUserSongData,
    loadUserPlaylistData,
    isLoading,
  } = useFirestoreMethods();

  useEffect(() => {
    const loadData = async () => {
      // try {
      //   await loadAppConfigData(Constants.appConfigDocId);
      // } catch (error) {
      //   console.log("Loading app settings failed:", error);
      // }

      try {
        await loadUserAppConfigData();
      } catch (error) {
        console.log("Loading user app settings failed:", error);
      }

      // instead of loading the artists, use the artists from the loaded songs instead
      // await loadArtistData();

      await loadUserSongData();
      await loadUserPlaylistData();
    };

    loadData();
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Remix’s Outlet renders the matched route’s component, which will be wrapped by Layout.
  return <Outlet />;
}
