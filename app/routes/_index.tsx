// app/routes/_index.tsx

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, redirect, useLoaderData } from "@remix-run/react";
import { isSessionValid } from "~/fb.sessions.server";

import { useFirestoreCache } from "~/hooks/useFirestoreCache";
import SortableSongList from "~/components/sortable-song-list";

export const meta: MetaFunction = () => {
  return [
    { title: "ChordMaster" },
    { name: "description", content: "Sheet music, chords and tabs" },
  ];
};

// use loader to check for existing session, if not found, send the user to login
export async function loader({ request }: LoaderFunctionArgs) {
  const userSession = await isSessionValid(request);

  if (userSession?.success) {
    const decodedClaims = userSession?.decodedClaims;
    return { decodedClaims };
  } else {
    throw redirect("/login", {
      statusText: (userSession?.error as Error)?.message,
    });
  }
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const { documents } = useFirestoreCache(loaderData?.decodedClaims?.uid);

  return (
    <>
      {loaderData.decodedClaims?.email && (
        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="grid grid-cols-2 gap-2">
            <div>You are logged in as:</div>
            <div className="text-blue-600">
              {loaderData.decodedClaims?.email}
            </div>
          </div>
          <div className="text-center">
            Do you want to{" "}
            <Link to="/logout" className="font-medium underline">
              Log Out?
            </Link>
          </div>
        </div>
      )}

      <SortableSongList allItems={documents} />
    </>
  );
}
