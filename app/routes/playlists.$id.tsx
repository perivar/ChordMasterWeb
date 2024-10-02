// app/routes/playlists.$id.tsx

import { useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { deletePlaylistReducer, useAppContext } from "~/context/AppContext";
import { Edit2Icon, PlusIcon, Trash2 } from "lucide-react";

import useFirestore, { ISong } from "~/hooks/useFirestore";
import usePlaylists from "~/hooks/usePlaylists";
import useSongs from "~/hooks/useSongs";
import { Button } from "~/components/ui/button";
import { useConfirm } from "~/components/layout/confirm-provider";
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
  const confirm = useConfirm();
  const { dispatch } = useAppContext();

  const { deletePlaylist } = useFirestore();

  const playlist = allPlaylists.find(a => a.id === playlistIdParam);

  // Use type guard to filter out undefined values
  const notUndefined = (anyValue: ISong | undefined): anyValue is ISong =>
    anyValue !== undefined;
  const playlistSongs = playlist?.songIds
    .map(id => allSongs.find(s => s.id === id))
    .filter(notUndefined);

  const [songs, _setSongs] = useState<ISong[]>(playlistSongs ?? []);

  const handleDelete = async (
    id: string | undefined,
    playlistName: string | undefined
  ) => {
    try {
      await confirm({
        title: `Delete Playlist (${playlistName})`,
        description: "Are you sure you want to permanently delete it?",
      });

      if (id) {
        await deletePlaylist(id);
        dispatch(deletePlaylistReducer(id));

        console.log(`Deleted item with id: ${id}`);
      }
    } catch (_err) {
      // If the user cancels the confirmation, handle the rejection here
      console.log(`Delete operation was cancelled (id: ${id})`);
    }
  };

  if (!songs) return null;

  return (
    <div className="container mx-auto my-6">
      <div className="mb-2 flex w-full flex-row items-center justify-between">
        <div className="flex-1">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(playlist?.id, playlist?.name)}>
            <Trash2 className="size-4" />
            <span className="ml-2 hidden sm:block">Delete Playlist</span>
          </Button>
        </div>
        <div className="flex-1 text-center text-xl">{playlist?.name}</div>
        <div className="ml-2 flex flex-1 flex-row items-center justify-end gap-2">
          <Button asChild size="sm">
            <Link to={`/playlists/${playlist?.id}/edit`}>
              <Edit2Icon className="size-4" />
              <span className="ml-2 hidden sm:block">Edit Playlist</span>
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to={`/playlists/${playlist?.id}/addsongs`}>
              <PlusIcon className="size-4" />
              <span className="ml-2 hidden sm:block">Add Songs</span>
            </Link>
          </Button>
        </div>
      </div>

      <SortableSongList allItems={songs} />
    </div>
  );
}
