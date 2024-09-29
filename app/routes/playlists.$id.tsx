// app/routes/artists.$id.tsx

import { useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";

import { ISong } from "~/hooks/useFirestore";
import usePlaylists from "~/hooks/usePlaylists";
import useSongs from "~/hooks/useSongs";
import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => [
  { title: "Playlist" },
  { name: "description", content: "View Playlist" },
];

export default function PlaylistView() {
  const allSongs = useSongs();
  const params = useParams();
  const playlistIdParam = params?.id;
  const allPlaylists = usePlaylists();

  const playlist = allPlaylists.find(a => a.id === playlistIdParam);

  // const [songs, setSongs] = useState<ISong[]>();
  // Use type guard to filter out undefined values
  const notUndefined = (anyValue: ISong | undefined): anyValue is ISong =>
    anyValue !== undefined;
  const playlistSongs = playlist?.songIds
    .map(id => allSongs.find(s => s.id === id))
    .filter(notUndefined);

  const [songs, setSongs] = useState<ISong[]>(playlistSongs ?? []);

  if (!songs) return null;

  return (
    <div className="my-6">
      <SortableSongList allItems={songs} />
    </div>
  );
}
