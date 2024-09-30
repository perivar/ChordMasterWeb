// app/routes/playlists.$id.tsx

import { useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { Edit2Icon } from "lucide-react";

import { ISong } from "~/hooks/useFirestore";
import usePlaylists from "~/hooks/usePlaylists";
import useSongs from "~/hooks/useSongs";
import { Button } from "~/components/ui/button";
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

  // Use type guard to filter out undefined values
  const notUndefined = (anyValue: ISong | undefined): anyValue is ISong =>
    anyValue !== undefined;
  const playlistSongs = playlist?.songIds
    .map(id => allSongs.find(s => s.id === id))
    .filter(notUndefined);

  const [songs, _setSongs] = useState<ISong[]>(playlistSongs ?? []);

  if (!songs) return null;

  return (
    <div className="container mx-auto my-6">
      <div className="mb-2 flex flex-col items-center">
        <div className="flex flex-row items-center">
          <div className="text-center text-xl">{playlist?.name}</div>
          <div className="ml-4">
            <Button asChild size="sm" variant="outline">
              <Link to={`/playlists/${playlist?.id}/edit`}>
                <Edit2Icon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <SortableSongList allItems={songs} />
    </div>
  );
}
