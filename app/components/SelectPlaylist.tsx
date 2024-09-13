import { FunctionComponent, useState } from "react";
import { Dialog, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";

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
  const [showModal, setShowModal] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [playlists, setPlaylists] = useState<{ id: number; name: string }[]>([
    { id: 1, name: "Chill Vibes" },
    { id: 2, name: "Workout Playlist" },
    { id: 3, name: "Road Trip" },
  ]);
  const [newPlaylist, setNewPlaylist] = useState("");
  const [selectedPlaylists, setSelectedPlaylists] = useState<number[]>([]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handlePlaylistSelect = (playlistId: number) => {
    setSelectedPlaylists(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const handleCreatePlaylist = () => {
    if (newPlaylist) {
      setPlaylists(prev => [
        ...prev,
        { id: prev.length + 1, name: newPlaylist },
      ]);
      setNewPlaylist("");
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
                  checked={selectedPlaylists.includes(playlist.id)}
                  onCheckedChange={() => handlePlaylistSelect(playlist.id)}
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
              value={newPlaylist}
              onChange={e => setNewPlaylist(e.target.value)}
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
          <Button variant="ghost" onClick={toggleModal}>
            Cancel
          </Button>
          <Button onClick={toggleModal} variant="default">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectPlaylist;
