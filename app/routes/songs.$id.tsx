// app/routes/songs.$id.tsx

import { useEffect, useState } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { Link, useParams, useRouteLoaderData } from "@remix-run/react";
import { type loader as parentLoader } from "~/root";
import { getChordPro } from "~/utils/getChordPro";

import { ISong } from "~/hooks/useFirestore";
import { useFirestoreCache } from "~/hooks/useFirestoreCache";
import SongTransformer from "~/components/layout/song-transformer";
import { LoadingSpinner } from "~/components/loading-spinner";
import styles from "~/styles/chordsheetjs.css?url";

export const meta: MetaFunction = () => [
  // your meta here
  { title: "Song" },
  { name: "description", content: "View Song" },
];

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function SongView() {
  const params = useParams();
  const loaderData = useRouteLoaderData<typeof parentLoader>("root");
  const userId = loaderData?.decodedClaims?.uid;
  const { documents } = useFirestoreCache(userId);

  const [song, setSong] = useState<ISong>();
  const [fontSize, setFontSize] = useState<number>();
  const [showTabs, setShowTabs] = useState(false);
  const [content, setContent] = useState<string>("");
  const [tone, setTone] = useState<number>(0);

  // read using query client directly
  // const queryClient = useQueryClient();
  // const queryClientData = queryClient.getQueryData<{
  //   songs: ISong[];
  // }>(["songs", userId]);

  // useEffect(() => {
  //   if (!queryClientData) return;

  //   // Find the song by ID in the cached data
  //   const foundSong = queryClientData.songs.find(s => s.id === params.id);
  //   setSong(foundSong);
  // }, [queryClientData, params.id]);

  // read using the cache hook
  useEffect(() => {
    if (!documents) return;

    // Find the song by ID in the cached data
    const foundSong = documents.find(s => s.id === params.id);
    setSong(foundSong);
  }, [documents, params.id]);

  useEffect(() => {
    if (song) {
      setContent(getChordPro(song));

      if (song.transposeAmount !== undefined) {
        setTone(song.transposeAmount);
      }

      if (song.fontSize !== undefined) {
        setFontSize(song.fontSize);
      }

      if (song.showTablature !== undefined) {
        setShowTabs(song.showTablature);
      }
    }
  }, [song]);

  if (!content) {
    return (
      <div className="mx-auto mt-6 flex items-center justify-center">
        <LoadingSpinner className="mr-2 size-4" />
        <h1>No content.</h1>
      </div>
    );
  }

  return (
    <SongTransformer
      chordProSong={content}
      transposeDelta={tone}
      showTabs={showTabs}
      fontSize={fontSize}>
      {songProps => (
        <div className="mx-auto mt-6 flex flex-col pb-6 pl-6">
          {<div dangerouslySetInnerHTML={{ __html: songProps.htmlSong }} />}
          {/* <style>{`
            .chord-sheet {
              font-family: monospace;
            }
            .chord-sheet .comment {
              color: #00ccee;
              display: block;
              font-weight: bold;
              margin-top: 1em
            }
            .chord-sheet .row {
              display: flex
            }             
            .chord-sheet .column {
              margin-right: 1em;
            } 
            .chord-sheet .paragraph {
              margin-bottom: 1em
            }
            .chord-sheet .chord {
              font-weight: bold;
              color: #3b82f6;
            }
            .chord-sheet .chord:not(:last-child) {
              padding-right: 10px
            }
            .chord-sheet .chord:after {
              content: "\\200b"
            }
            .chord-sheet .lyrics:after {
              content: "\\200b"
            }
       `}</style> */}
          <div>
            {song?.external?.url && (
              <Link to={song?.external?.url}>{song?.external?.source}</Link>
            )}
          </div>
        </div>
      )}
    </SongTransformer>
  );
}
