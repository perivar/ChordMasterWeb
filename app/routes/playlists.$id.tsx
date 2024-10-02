// app/routes/playlists.$id.tsx

import { useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { Edit2Icon, PlusIcon } from "lucide-react";

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
      <div className="mb-2 flex w-full flex-row items-center justify-between gap-2">
        <div className="flex-1 text-center text-xl">{playlist?.name}</div>
        <div>
          <Button asChild size="sm">
            <Link to={`/playlists/${playlist?.id}/edit`}>
              <Edit2Icon className="mr-2 size-4" />
              Edit Playlist
            </Link>
          </Button>
        </div>

        <div>
          <Button asChild size="sm">
            <Link to={`/playlists/${playlist?.id}/addsongs`}>
              <PlusIcon className="mr-2 size-4" />
              Add Songs
            </Link>
          </Button>
        </div>
      </div>

      <SortableSongList allItems={songs} />
    </div>
  );
}
