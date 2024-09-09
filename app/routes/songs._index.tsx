// app/routes/songs._index.tsx

import type { MetaFunction } from "@remix-run/node";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { type loader as parentLoader } from "~/root";

import { useFirestoreCache } from "~/hooks/useFirestoreCache";
import SortableSongList from "~/components/sortable-song-list";

export const meta: MetaFunction = () => {
  return [
    { title: "ChordMaster" },
    { name: "description", content: "Sheet music, chords and tabs" },
  ];
};

export default function Index() {
  const loaderData = useRouteLoaderData<typeof parentLoader>("root");
  const userId = loaderData?.decodedClaims?.uid;
  const { documents } = useFirestoreCache(userId);
  // const documents = dummySongList;

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

      <SortableSongList allItems={documents} />
      {/* <table>
        <tbody>
          {documents.map((song, i) => (
            <tr key={song.id}>
              <td>
                <Link to={`/songs/${song.id}`}>{song.title}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </>
  );
}
