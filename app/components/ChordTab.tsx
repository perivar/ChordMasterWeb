import { FunctionComponent, useEffect, useRef } from "react";
import { getChordAsString } from "~/utils/getChordAsString";
import { getChordInformationTonal } from "~/utils/getChordInformationTonal";
import { getChordSymbolTonal } from "~/utils/getChordSymbolTonal";
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

// chords.json
// export interface ChordsData {
//   [index: string]: {
//     positions: string[]; // ['5', '7']
//     fingerings: string[][]; // [ ['0', '0'], ['1', '1'] ]
//   }[];
// }

// guitar.json
export interface ChordPosition {
  // which fret is which finger at. 1 - 4 or, 0 = open, -1 = non-used
  frets: number[];
  // fingers 0 - 4
  fingers: number[];
  // fret to start (number), normally undefined
  baseFret: number;
  // which fret is the barre? (2-4)
  barres?: number[];
  // whether the barres overlaps the whole fretboard
  capo?: boolean;
  midi: number[];
}

export interface ChordElement {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

interface Chords {
  [key: string]: ChordElement[];
}

interface Tunings {
  standard: string[];
}

interface Main {
  strings: number;
  fretsOnChord: number;
  name: string;
  numberOfChords: number;
}

export interface GuitarChords {
  main: Main;
  tunings: Tunings;
  keys: string[];
  suffixes: string[];
  chords: Chords;
}

interface Props {
  guitarChords: GuitarChords;
  showPiano: boolean;
  selectedChord: Chord | null | undefined;
  allChords: Chord[];
  onPressClose: () => void;
  closeLabel: string;
}

const getChordMap = (jsonData: GuitarChords) => {
  // Initialize an empty Map
  const chordMap = new Map<string, ChordElement>();

  // Helper function to handle sharp/flat equivalences
  const addChordToMap = (chord: ChordElement, key: string, suffix: string) => {
    const combinedKey = `${key}${suffix}`;
    const combinedKeyNew = getChordSymbolTonal(combinedKey);
    chordMap.set(combinedKeyNew, chord);
  };

  // Mapping of flats to sharps, and the other way around
  // https://github.com/tombatossals/chords-db/issues/24
  // The database has only registered the flat chords, as they are the same as the sharp of the anterior key:
  // A# = Bb, D# = Eb, G# = Ab
  const equivalentMap: Record<string, string> = {
    "C#": "Db",
    "F#": "Gb",
    Eb: "D#",
    Ab: "G#",
    Bb: "A#",
  };

  // Iterate over the keys (C, C#, etc.)
  for (const key in jsonData.chords) {
    // Iterate over each chord (which contains key and suffix)
    jsonData.chords[key].forEach(chord => {
      // Sort the chord positions by baseFret
      chord.positions.sort((a, b) => a.baseFret - b.baseFret);

      // Add the original chord
      addChordToMap(chord, chord.key, chord.suffix);

      // If the chord key is a flat (Bb, Eb, Ab), add the corresponding sharp equivalent
      if (equivalentMap[chord.key]) {
        const equivalent = equivalentMap[chord.key];
        addChordToMap(chord, equivalent, chord.suffix);
      }
    });
  }

  return chordMap;
};

const renderPianoChord = (
  notesChordAlternatives: NotesChordAlternatives | undefined
) => {
  if (!notesChordAlternatives) return null;

  return (
    <div className="m-2 flex flex-col p-2">
      {/* Piano Notes */}
      <div className="flex justify-between font-semibold">
        {notesChordAlternatives.chordNotes.map(note => (
          <div key={note} className="w-8 text-center">
            <p className="text-base">{note}</p>
          </div>
        ))}
        {notesChordAlternatives.bassNote && (
          <div className="w-8 text-center">
            <p className="text-base">/{notesChordAlternatives.bassNote}</p>
          </div>
        )}
      </div>

      {/* Piano Intervals */}
      <div className="flex justify-between">
        {notesChordAlternatives.chordIntervals.map(interval => (
          <div key={interval} className="w-8 text-center">
            <p className="text-sm">{interval}</p>
          </div>
        ))}
        {notesChordAlternatives.bassNote && <div className="w-8 text-center" />}
      </div>

      {/* Piano Chord Names */}
      <div className="text-center">
        {notesChordAlternatives.chordNames.map(chord => (
          <p key={chord} className="text-sm text-blue-500">
            {chord}
          </p>
        ))}
      </div>
    </div>
  );
};

const renderGuitarChord = (
  guitarChord: ChordElement | undefined,
  guitarChordLookup: string
) => {
  return (
    <>
      {/* Guitar Chord Chart */}
      <ChordChart chord={guitarChord} />
      <p className="text-center text-sm">{guitarChordLookup}</p>
    </>
  );
};

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

  const chordMap = getChordMap(guitarChords);

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
            const isSelected = chordName === selectedChordName;

            let guitarChordLookup = chordName;
            const lookupChordInfo = getChordInformationTonal(chordName);

            let guitarChord: ChordElement | undefined = undefined;
            if (lookupChordInfo.isChord) {
              guitarChord = chordMap.get(lookupChordInfo.chordName);
              guitarChordLookup = lookupChordInfo.chordName;
            }
            if (!guitarChord && lookupChordInfo.chordName.includes("/")) {
              // lookup again without the bassNote
              const split = lookupChordInfo.chordName.split("/");
              const chordNameNoBass = split[0];
              guitarChord = chordMap.get(chordNameNoBass);
              guitarChordLookup = chordNameNoBass;
            }

            // Get piano alternatives only if showPiano is true
            const notesChordAlternatives = showPiano
              ? getNotesChordAlternatives(chordName, getChordInformation, true)
              : undefined;

            return (
              <div
                key={index}
                ref={el => {
                  if (el) {
                    columnRefs.current[index] = el;
                  }
                }}
                className={`${isSelected ? "border-2 border-cyan-500" : ""}`}>
                {showPiano
                  ? renderPianoChord(notesChordAlternatives)
                  : renderGuitarChord(guitarChord, guitarChordLookup)}
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
