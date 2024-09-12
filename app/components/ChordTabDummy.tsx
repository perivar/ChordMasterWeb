import { getChordAsString } from "~/utils/getChordAsString";
import { Chord } from "chordsheetjs";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

// Helper function to get chord information
const getChordInfo = (chord: string) => {
  const chordNotesMap: { [key: string]: string[] } = {
    C: ["C", "E", "G"],
    G: ["G", "B", "D"],
    Am: ["A", "C", "E"],
    F: ["F", "A", "C"],
    // Add more chords as needed
  };
  return chordNotesMap[chord] || ["Unknown notes"];
};

// Component for showing chord details in the drawer
const ChordInfoPanel = ({
  chord,
  onClose,
}: {
  chord: string;
  onClose: () => void;
}) => {
  const notes = getChordInfo(chord);
  return (
    <Drawer open={!!chord} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{chord ? `${chord}` : ""}</DrawerTitle>
          <DrawerDescription>Notes: {notes.join(", ")}</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

interface Props {
  showPiano: boolean;
  selectedChord: Chord | null | undefined;
  allChords: Chord[];
  onPressClose: () => void;
  closeLabel: string;
}

// Main component for rendering the chord sheet
const ChordTabDummy = ({
  showPiano,
  selectedChord,
  allChords,
  onPressClose,
  closeLabel,
}: Props) => {
  const chordName = selectedChord ? getChordAsString(selectedChord) : "";

  return (
    <div>
      {selectedChord && (
        <ChordInfoPanel chord={chordName} onClose={onPressClose} />
      )}
    </div>
  );
};

export default ChordTabDummy;
