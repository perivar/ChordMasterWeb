// app/routes/songs._index.tsx

import type { MetaFunction } from "@remix-run/node";

import useSongs from "~/hooks/useSongs";
import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => {
  return [{ title: "Songs" }, { name: "description", content: "View Songs" }];
};

export default function SongsView() {
  const songs = useSongs();

  return (
    <div className="my-6">
      <SortableSongList allItems={songs} />
    </div>
  );
}
