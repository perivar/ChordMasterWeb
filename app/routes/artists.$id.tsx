// app/routes/artists.$id.tsx

import { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";

import useSongs from "~/hooks/useSongs";
import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => [
  { title: "Artist" },
  { name: "description", content: "View Artist" },
];

export default function ArtistView() {
  const songs = useSongs();
  const params = useParams();
  const artistIdParam = params?.id;
  const artistSongs = songs.filter(s => s.artist.id === artistIdParam);

  return (
    <div className="my-6">
      <SortableSongList allItems={artistSongs} />
    </div>
  );
}
