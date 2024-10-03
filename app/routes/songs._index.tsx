// app/routes/songs._index.tsx

import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { PlusIcon } from "lucide-react";

import useSongs from "~/hooks/useSongs";
import { Button } from "~/components/ui/button";
import SortableSongList from "~/components/SortableSongList";

export const meta: MetaFunction = () => {
  return [{ title: "Songs" }, { name: "description", content: "View Songs" }];
};

export default function SongsView() {
  const songs = useSongs();
  const navigate = useNavigate();

  const addNewSong = () => {
    return navigate(`/songs/new/edit`);
  };

  return (
    <div className="container mx-auto my-6">
      <div className="mb-2 flex w-full flex-row items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex-1 text-center text-xl">Songs</div>
        <div className="ml-2 flex flex-1 flex-row items-center justify-end gap-2">
          <Button size="sm" onClick={addNewSong}>
            <PlusIcon className="size-4 " />
            <span className="ml-2 hidden sm:block">Add Song</span>
          </Button>
        </div>
      </div>
      <SortableSongList allItems={songs} />
    </div>
  );
}
