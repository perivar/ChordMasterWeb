// app/routes/songs._index.tsx

import type { MetaFunction } from "@remix-run/node";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { type loader as parentLoader } from "~/root";

import useSongs from "~/hooks/useSongs";
import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => {
  return [{ title: "Songs" }, { name: "description", content: "View Songs" }];
};

export default function Index() {
  const loaderData = useRouteLoaderData<typeof parentLoader>("root");
  const songs = useSongs();

  return (
    <>
      {loaderData?.decodedClaims?.email && (
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

      <div className="mb-6">
        <SortableSongList allItems={songs} />
      </div>
    </>
  );
}
