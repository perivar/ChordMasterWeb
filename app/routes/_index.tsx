// app/routes/_index.tsx

import type { MetaFunction } from "@remix-run/node";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { type loader as parentLoader } from "~/root";

import { useToast } from "~/components/ui/use-toast";

export const meta: MetaFunction = () => {
  return [
    { title: "ChordMaster" },
    { name: "description", content: "Sheet music, chords and tabs" },
  ];
};

export default function Index() {
  const { toast } = useToast();
  const loaderData = useRouteLoaderData<typeof parentLoader>("root");

  return (
    <section className="flex min-h-screen w-full flex-col">
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
      <div className="container flex flex-1 justify-center overflow-x-hidden p-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 p-4 text-center md:w-1/2">
          <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">
            <h1 className="text-2xl font-bold tracking-tighter md:text-3xl">
              Welcome to
            </h1>
            <span className="bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 bg-clip-text font-extrabold text-transparent">
              Chord Master
            </span>{" "}
          </h1>

          <div className="font-sans">
            <ul className="mt-4 list-disc">
              <li>
                <Link
                  className="hover:underline"
                  to="/playlists"
                  rel="noreferrer">
                  Playlists
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline"
                  to="/artists"
                  rel="noreferrer">
                  Artists
                </Link>
              </li>
              <li>
                <Link className="hover:underline" to="/songs" rel="noreferrer">
                  Songs
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
