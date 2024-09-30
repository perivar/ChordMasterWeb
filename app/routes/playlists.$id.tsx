// app/routes/artists.$id.tsx

import { useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { GripVertical, Music } from "lucide-react";

import { ISong } from "~/hooks/useFirestore";
import usePlaylists from "~/hooks/usePlaylists";
import useSongs from "~/hooks/useSongs";
import { Card, CardContent } from "~/components/ui/card";
import { DraggableList } from "~/components/DraggableList";

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

  const [songs, setSongs] = useState<ISong[]>(playlistSongs ?? []);

  const handleReorder = (newOrder: ISong[]) => {
    console.log("New Order: ", newOrder);
    // Handle updating the new song order in your state/store
  };

  const renderOverlay = (song: ISong) => (
    <Card className="border-2 border-primary">
      <CardContent className="flex items-center p-4">
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
      {/* <SortableSongList allItems={songs} /> */}
      <DraggableList<ISong>
        items={songs}
        getId={song => song.id as UniqueIdentifier}
        onReorder={handleReorder}
        renderItem={(song, isDragging, attributes, listeners) => (
          <Card className={`mb-2 `}>
            {/* ${isDragging ? "border-2 border-primary" : ""} */}
            <CardContent className="flex items-center p-4">
              <div
                className="mr-2 cursor-move p-2"
                {...attributes}
                {...listeners}>
                <GripVertical className="text-gray-400" />
              </div>
              <Music className="mr-2" />
              <div>
                <div className="font-semibold">{song.title}</div>
                <div className="text-sm text-gray-500">{song.artist.name}</div>
              </div>
            </CardContent>
          </Card>
        )}
        renderOverlay={renderOverlay}
      />
    </div>
  );
}
