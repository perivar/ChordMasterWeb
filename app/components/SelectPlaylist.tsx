import { FunctionComponent, useState } from "react";
import { Dialog, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";

import useFirestoreMethods from "~/hooks/useFirestoreMethods";
import usePlaylists from "~/hooks/usePlaylists";

import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
  show: boolean;
  songId?: string;
  onPressClose: () => void;
}

const SelectPlaylist: FunctionComponent<Props> = ({
  show,
  songId,
  onPressClose,
}) => {
  const {
    hasPlaylistContainsSong,
    playlistRemoveSong,
    playlistAddSong,
    addPlaylist,
  } = useFirestoreMethods();
  const playlists = usePlaylists();

  const [showInput, setShowInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const onSelectPlaylist = async (id: string) => {
    console.log("Selecting playlist:", id);
    const playlist = playlists.find(a => a.id === id);

    if (songId && playlist) {
      if (hasPlaylistContainsSong(playlist.id!, songId)) {
        await playlistRemoveSong(playlist.id!, songId);
      } else {
        await playlistAddSong(playlist.id!, songId);
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (newPlaylistName) {
      await addPlaylist(newPlaylistName, []);

      setNewPlaylistName("");
      setShowInput(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={onPressClose}>
      <DialogTitle></DialogTitle>
      <DialogDescription></DialogDescription>
      <DialogContent className="space-y-4 p-6">
        <h3 className="text-lg font-medium">Select Playlist</h3>

        <ScrollArea className="h-[200px] space-y-2">
          {playlists.length > 0 ? (
            playlists.map(playlist => (
              <div
                key={playlist.id}
                className="flex items-center justify-between rounded-md border border-border p-2">
                <span>{playlist.name}</span>
                <Checkbox
                  checked={hasPlaylistContainsSong(playlist.id!, songId!)}
                  onCheckedChange={() => onSelectPlaylist(playlist.id!)}
                />
              </div>
            ))
          ) : (
            <p>No playlists available</p>
          )}
        </ScrollArea>

        {/* Create new playlist */}
        {showInput ? (
          <div className="space-y-2">
            <Input
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder="New Playlist Name"
            />
            <Button onClick={handleCreatePlaylist} variant="secondary">
              <Plus className="mr-2" /> Create Playlist
            </Button>
          </div>
        ) : (
          <Button onClick={() => setShowInput(true)} variant="outline">
            <Plus className="mr-2" /> New Playlist
          </Button>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onPressClose}>
            Cancel
          </Button>
          <Button onClick={onPressClose} variant="default">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectPlaylist;
