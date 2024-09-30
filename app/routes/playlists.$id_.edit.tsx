// app/routes/playlists.$id_edit.tsx

import { useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { GripVertical, Music, Trash2 } from "lucide-react";

import { ISong } from "~/hooks/useFirestore";
import usePlaylists from "~/hooks/usePlaylists";
import useSongs from "~/hooks/useSongs";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { DraggableList } from "~/components/DraggableList";
import { useConfirm } from "~/components/layout/confirm-provider";

export const meta: MetaFunction = () => [
  { title: "Edit Playlist" },
  { name: "description", content: "Edit Playlist" },
];

export default function PlaylistView() {
  const allSongs = useSongs();
  const params = useParams();
  const playlistIdParam = params?.id;
  const allPlaylists = usePlaylists();
  const confirm = useConfirm();

  const playlist = allPlaylists.find(a => a.id === playlistIdParam);

  // Use type guard to filter out undefined values
  const notUndefined = (anyValue: ISong | undefined): anyValue is ISong =>
    anyValue !== undefined;
  const playlistSongs = playlist?.songIds
    .map(id => allSongs.find(s => s.id === id))
    .filter(notUndefined);

  const [songs, _setSongs] = useState<ISong[]>(playlistSongs ?? []);

  const handleReorder = (newOrder: ISong[]) => {
    console.log("New Order: ", newOrder);
    // Handle updating the new song order in your state/store
  };

  const handleRemove = async (
    id: string | undefined,
    songTitle: string | undefined
  ) => {
    try {
      await confirm({
        title: `Remove (${songTitle}) from Playlist`,
        description: "Are you sure you want to remove the song?",
      });

      // Here you can add the logic to delete the item after confirmation
      // Example: await deleteItem(id);

      console.log(`Removed song with id: ${id}`);
    } catch (_err) {
      // If the user cancels the confirmation, handle the rejection here
      console.log(`Remove operation was cancelled (id: ${id})`);
    }
  };

  const renderOverlay = (song: ISong) => (
    <Card className="border-2 border-primary">
      <CardContent className="flex items-center p-4">
        <div className="mr-2 cursor-move p-2">
          <GripVertical className="text-gray-400" />
        </div>
        <Music className="mr-2" />
        <div>
          <div className="font-semibold">{song.title}</div>
          <div className="text-sm text-gray-500">{song.artist.name}</div>
        </div>
      </CardContent>
    </Card>
  );

  if (!songs) return null;

  return (
    <div className="container mx-auto my-6">
      <div className="mb-6 flex w-full flex-col text-center text-xl">
        {playlist?.name}
      </div>
      <DraggableList<ISong>
        items={songs}
        getId={song => song.id as UniqueIdentifier}
        onReorder={handleReorder}
        renderItem={(song, _isDragging) => (
          <DraggableList.Item id={song.id as UniqueIdentifier}>
            <Card className={`mb-2 `}>
              {/* ${isDragging ? "border-2 border-primary" : ""} */}
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-1 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemove(song.id, song.title)}>
                    <Trash2 className="size-6" />
                  </Button>
                  <div>
                    <div className="font-semibold">
                      <Link to={`/songs/${song.id}`}>{song.title}</Link>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Link to={`/artists/${song.artist.id}`}>
                        {song.artist.name}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="mr-2 cursor-move p-2">
                  <DraggableList.DragHandle>
                    <GripVertical className="text-gray-400" />
                  </DraggableList.DragHandle>
                </div>
              </CardContent>
            </Card>
          </DraggableList.Item>
        )}
        renderOverlay={renderOverlay}
      />
    </div>
  );
}
