// app/routes/song.$id.tsx

import { useEffect, useState } from "react";
import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { isSessionValid } from "~/fb.sessions.server";

import { ISong } from "~/hooks/useFirestore";
import { useFirestoreCache } from "~/hooks/useFirestoreCache";
import SongTransformer from "~/components/layout/song-transformer";

export const meta: MetaFunction = () => [
  // your meta here
  { title: "Song" },
  { name: "description", content: "View Song" },
];

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

const getChordPro = (song: ISong) => {
  let headerlessContent = song.content;
  headerlessContent = headerlessContent.replace(/{artist:[^}]*}\n/g, "");
  headerlessContent = headerlessContent.replace(/{title:[^}]*}\n/g, "");
  const header = `{title: ${song.title}}\n` + `{artist: ${song.artist.name}}\n`;
  return header + headerlessContent;
};

export default function SongView() {
  const params = useParams();
  const loaderData = useLoaderData<typeof loader>();
  const { documents } = useFirestoreCache(loaderData?.decodedClaims?.uid);

  const [fontSize, setFontSize] = useState<number>();
  const [showTabs, setShowTabs] = useState(false);
  const [content, setContent] = useState<string>("");
  const [tone, setTone] = useState<number>(0);

  const song = documents.find(s => s.id === params.id);

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

  if (!content) return;

  return (
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
