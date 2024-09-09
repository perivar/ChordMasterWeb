// app/routes/songs.$id.tsx

import { useEffect, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, useParams, useRouteLoaderData } from "@remix-run/react";
import { type loader as parentLoader } from "~/root";

import { ISong } from "~/hooks/useFirestore";
import { useFirestoreCache } from "~/hooks/useFirestoreCache";
import SongTransformer from "~/components/layout/song-transformer";

export const meta: MetaFunction = () => [
  // your meta here
  { title: "Song" },
  { name: "description", content: "View Song" },
];

const getChordPro = (song: ISong) => {
  let headerlessContent = song.content;
  headerlessContent = headerlessContent.replace(/{artist:[^}]*}\n/g, "");
  headerlessContent = headerlessContent.replace(/{title:[^}]*}\n/g, "");
  const header = `{title: ${song.title}}\n` + `{artist: ${song.artist.name}}\n`;
  return header + headerlessContent;
};

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

  // uncommenting this causes an everlasting loop
  // if (!content) {
  //   throw redirect("/", {
  //     statusText: "Could not load song content, please refresh song list.",
  //   });
  // }

  return (
    // <div>{JSON.stringify(song)}</div>
    <SongTransformer
      chordProSong={content}
      transposeDelta={tone}
      showTabs={showTabs}
      fontSize={fontSize}>
      {songProps => (
        <div style={{ flex: 1 }}>
          {song?.external?.url && (
            <Link to={song?.external?.url}>{song?.external?.source}</Link>
          )}
          {<div dangerouslySetInnerHTML={{ __html: songProps.htmlSong }} />}
        </div>
      )}
    </SongTransformer>
  );
}
