import { FunctionComponent, useEffect, useRef } from "react";
import { getChordAsString } from "~/utils/getChordAsString";
import {
  getNotesChordAlternatives,
  NotesChordAlternatives,
} from "~/utils/getNotesChordAlternatives";
import { Chord } from "chordsheetjs";

import { getChordInformation } from "../utils/getChordInformation";
import ChordChart from "./ChordChart";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

export interface ChordsData {
  [index: string]: {
    positions: string[]; // ['5', '7']
    fingerings: string[][]; // [ ['0', '0'], ['1', '1'] ]
  }[];
}

interface Props {
  guitarChords: ChordsData;
  showPiano: boolean;
  selectedChord: Chord | null | undefined;
  allChords: Chord[];
  onPressClose: () => void;
  closeLabel: string;
}

const ChordTab: FunctionComponent<Props> = ({
  guitarChords,
  showPiano,
  selectedChord,
  allChords,
  onPressClose,
  closeLabel,
}) => {
  const columnRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (selectedChord) {
      const index = allChords.findIndex(
        chord => chord.toString() === selectedChord.toString()
      );

      if (columnRefs.current[index]) {
        columnRefs.current[index].scrollIntoView({
          behavior: "smooth", // For smooth scrolling
          block: "nearest", // Scroll to the nearest block position
          inline: "start", // Scroll horizontally
        });
      }
    }
  }, [selectedChord, allChords]);

  if (!selectedChord) return null;

  return (
    <Drawer open={!!selectedChord} onOpenChange={onPressClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{selectedChord.toString()}</DrawerTitle>
          <DrawerDescription />
        </DrawerHeader>

        <div className="flex flex-row overflow-x-auto">
          {allChords.map((item, index) => {
            const chordName = getChordAsString(item);
            const selectedChordName = getChordAsString(selectedChord);

            let position: string[] = [];
            if (guitarChords.hasOwnProperty(chordName)) {
              const chordObj = guitarChords[chordName].find(() => true);
              if (chordObj) {
                position = chordObj.positions;
              }
            }

            const selected = chordName === selectedChordName;

            let notesChordAlternatives: NotesChordAlternatives = {
              chordNotes: [],
              chordNames: [],
              chordIntervals: [],
              rootNote: undefined,
              bassNote: undefined,
            };
            if (showPiano) {
              notesChordAlternatives = getNotesChordAlternatives(
                chordName,
                // 'C°7(addM7,11,b13)',
                getChordInformation,
                true
              );
            }

            return (
              <div
                key={index}
                ref={el => {
                  if (el) {
                    columnRefs.current[index] = el;
                  }
                }}
                className={`m-2 p-2 ${selected ? "border-2 border-cyan-500" : ""}`}>
                {showPiano ? (
                  <div className="flex flex-col">
                    <div className="flex justify-between">
                      {notesChordAlternatives?.chordNotes.map(note => (
                        <div key={note} className="w-8 text-center">
                          <p className="text-base">{note}</p>
                        </div>
                      ))}
                      {notesChordAlternatives?.bassNote && (
                        <div
                          key={notesChordAlternatives.bassNote}
                          className="w-8">
                          <p className="text-base">
                            /{notesChordAlternatives.bassNote}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between">
                      {notesChordAlternatives?.chordIntervals.map(interval => (
                        <div key={interval} className="w-8 text-center">
                          <p className="text-sm">{interval}</p>
                        </div>
                      ))}
                      {notesChordAlternatives?.bassNote && (
                        <div className="w-8 text-center" />
                      )}
                    </div>
                    <div className="text-center">
                      {notesChordAlternatives?.chordNames.map(chord => (
                        <p key={chord} className="text-sm">
                          {chord}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <ChordChart width={100} height={120} chord={position} />
                    <p className="m-6 text-sm">{chordName}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <Button onClick={onPressClose} variant="outline" className="m-2 p-2">
          {closeLabel}
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default ChordTab;
