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

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import clsx from "clsx";

import ConfirmProvider from "./components/layout/confirm-provider";
import ResponsiveNavBar from "./components/responsive-navbar";
import { Toaster } from "./components/ui/toaster";
import { isSessionValid } from "./fb.sessions.server";

// https://gist.github.com/keepforever/43c5cfa72cad8b1dad2f3982fe81b576?permalink_comment_id=5117253#gistcomment-5117253

// Return the theme and the session from the session storage using the loader
export async function loader({ request }: LoaderFunctionArgs) {
  // get theme
  const { getTheme } = await themeSessionResolver(request);

  // check if we are authenticated, and if we are, return the claims
  const userSession = await isSessionValid(request);
  let decodedClaims;
  if (userSession?.success) {
    decodedClaims = userSession?.decodedClaims;
  }

  return { theme: getTheme(), decodedClaims };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 4 * 60 * 60 * 1000, // Keep cached for 4 hours
      gcTime: 24 * 60 * 60 * 1000, // Keep unused cache for 24 hours
      refetchOnReconnect: false, // Prevent refetch on reconnect
      refetchOnMount: false, // Prevent refetch on mount
      refetchOnWindowFocus: false, // Prevent refetch on window focus
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const theme = data?.theme ?? null;

  return (
    <ThemeProvider specifiedTheme={theme} themeAction="/action/set-theme">
      <HTML lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <PreventFlashOnWrongTheme ssrTheme={Boolean(theme)} />
          <Links />
        </head>
        <body>
          <ResponsiveNavBar />
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister: localStoragePersister,
            }}>
            {/* children will be the root Component, ErrorBoundary, or HydrateFallback */}
            <ConfirmProvider>{children}</ConfirmProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </PersistQueryClientProvider>
          <ScrollRestoration />
          <Scripts />
          <Toaster />
        </body>
      </HTML>
    </ThemeProvider>
  );
}

function HTML({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [theme] = useTheme();

  return (
    <html className={clsx(theme, className)} {...props}>
      {children}
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
