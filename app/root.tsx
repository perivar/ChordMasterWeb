import { useEffect } from "react";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import clsx from "clsx";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";

import ConfirmProvider from "./components/layout/confirm-provider";
import LoadingIndicator from "./components/LoadingIndicator";
import ResponsiveNavBar from "./components/ResponsiveNavBar";
import { Toaster } from "./components/ui/toaster";
import {
  AppProvider,
  loadStateFromLocalStorage,
  setStateReducer,
  useAppContext,
} from "./context/AppContext";
import { UserProvider, useUser } from "./context/UserContext";
import { isSessionValid } from "./fb.sessions.server";
import useFirebaseUser from "./hooks/useFirebaseUser";
import { IAuthUser } from "./hooks/useFirestore";
import useFirestoreMethods from "./hooks/useFirestoreMethods";
import { themeSessionResolver } from "./theme.sessions.server";

import "@fontsource-variable/montserrat/wght.css";
import "@fontsource-variable/roboto-mono/wght.css";
import "@fontsource-variable/roboto-slab/wght.css";
import "./tailwind.css";

import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";

import i18next, { localeCookie } from "./i18n/i18n.server";

// dark mode
// https://gist.github.com/keepforever/43c5cfa72cad8b1dad2f3982fe81b576?permalink_comment_id=5117253#gistcomment-5117253

// i18n
// https://sergiodxa.com/tutorials/add-i18n-to-a-remix-vite-app

export const handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "translation",
};

// Return the theme and the session from the session storage using the loader
export async function loader({ request }: LoaderFunctionArgs) {
  // Get theme from session
  const themeSession = await themeSessionResolver(request);
  const theme = themeSession.getTheme();
  console.log("Theme: " + theme);

  // Get locale from i18next
  const locale = await i18next.getLocale(request);
  console.log("Locale: " + locale);

  // check if we are authenticated, and if we are, return the claims and the user
  const userSession = await isSessionValid(request);
  let decodedClaims;
  let user: IAuthUser = {
    uid: "",
    displayName: "",
    email: "",
    avatar: "",
  };
  if (userSession?.success) {
    decodedClaims = userSession?.decodedClaims;
    user = {
      uid: userSession.user?.uid ?? "",
      email: userSession.user?.email ?? "",
      displayName:
        userSession.user?.providerData[0]?.displayName ??
        userSession.user?.displayName ??
        "",
      avatar:
        userSession.user?.providerData[0]?.photoURL ??
        userSession.user?.photoURL ??
        "",
    };
  }
  return json(
    { theme, locale, decodedClaims, user },
    { headers: { "Set-Cookie": await localeCookie.serialize(locale) } }
  );
}

// It defines the overall page structure (header, footer, etc.) and renders children
export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData<typeof loader>("root");

  return (
    <ThemeProvider
      specifiedTheme={loaderData?.theme ?? null}
      themeAction="/action/set-theme">
      <UserProvider>
        <AppProvider>
          <ConfirmProvider>
            <InnerLayout
              ssrTheme={Boolean(loaderData?.theme)}
              locale={loaderData?.locale}>
              {children}
            </InnerLayout>
          </ConfirmProvider>
        </AppProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// In order to avoid the Error: useTheme must be used within a ThemeProvider
function InnerLayout({
  ssrTheme,
  locale,
  children,
}: {
  ssrTheme: boolean;
  locale?: string;
  children: React.ReactNode;
}) {
  const [theme] = useTheme();
  const { i18n } = useTranslation();

  return (
    <html lang={locale ?? "en"} dir={i18n.dir()} className={clsx(theme)}>
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
  const { locale } = useLoaderData<typeof loader>();
  useChangeLanguage(locale); // Change i18next language if locale changes

  useFirebaseUser();

  const { dispatch } = useAppContext();

  const { user } = useUser();

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

    // Check if a user exists
    if (user) {
      // check if the state exists in local storage
      // if not, it does not exist or has expired
      const persistedState = loadStateFromLocalStorage(user);

      if (persistedState) {
        // If a persisted state exists, update the app's state
        dispatch(setStateReducer(persistedState));
      } else {
        // If no persisted state, load the necessary data
        loadData();
      }
    }
  }, [user]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Remix’s Outlet renders the matched route’s component, which will be wrapped by Layout.
  return <Outlet />;
}
