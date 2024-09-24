import { FunctionComponent, useEffect, useRef } from "react";
import { getChordAsString } from "~/utils/getChordAsString";
import { getNotesChordAlternatives } from "~/utils/getNotesChordAlternatives";
import { Chord } from "chordsheetjs";

import { getChordInformation } from "../utils/getChordInformation";
import ChordChart2 from "./ChordChart2";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

// chords.json
export interface ChordsData {
  [index: string]: {
    positions: string[]; // ['5', '7']
    fingerings: string[][]; // [ ['0', '0'], ['1', '1'] ]
  }[];
}

// guitar.json
export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres?: number[];
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
  // guitarChords: ChordsData;
  guitarChords: GuitarChords;
  showPiano: boolean;
  selectedChord: Chord | null | undefined;
  allChords: Chord[];
  onPressClose: () => void;
  closeLabel: string;
}

/**
 * Appends "4" to suspended chords (e.g. "Asus" -> "Asus4", "Dsus/F#" -> "Dsus4/F#")
 * @param chordName - The name of the chord (e.g., "Asus", "Dsus/F#")
 * @returns The corrected chord name with "4" appended to suspended chords if necessary
 */
const fixSuspendedChordName = (chordName: string): string => {
  // Split the chord into its base and bass note parts (if any)
  const [baseChord, bassNote] = chordName.split("/");

  // Check if the base chord contains "sus" and is missing "2" or "4"
  if (/sus(?!2|4)/.test(baseChord)) {
    // Append "4" if no specific suspension is mentioned
    return bassNote ? `${baseChord}4/${bassNote}` : `${baseChord}4`;
  }

  // Return the original chord name if no changes are needed
  return chordName;
};

const getChordMap = (jsonData: GuitarChords) => {
  // Initialize an empty Map
  const chordMap = new Map<string, ChordElement>();

  // Iterate over the keys (C, C#, etc.)
  for (const key in jsonData.chords) {
    // Iterate over each chord (which contains key and suffix)
    jsonData.chords[key].forEach(chord => {
      // Construct the combination of key + suffix
      let combinedKey;
      if (chord.suffix === "major") {
        // If the suffix is "major", just use the key (e.g., "C" instead of "Cmajor")
        combinedKey = chord.key;
      } else if (chord.suffix === "minor") {
        // If the suffix is "minor", use "m" (e.g., "Cm" instead of "Cminor")
        combinedKey = `${chord.key}m`;
      } else if (chord.suffix === "aug") {
        // If the suffix is "aug", use "+" (e.g., "C+" instead of "Caug")
        combinedKey = `${chord.key}+`;
      } else {
        // For all other suffixes, use the full key + suffix (e.g., "Cdim7")
        combinedKey = `${chord.key}${chord.suffix}`;
      }

      // Add this combination as the key in the map, with the chord data as the value
      chordMap.set(combinedKey.toLowerCase(), chord);
    });
  }

  return chordMap;
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
            // guitarChordLookup = getChordSymbol(guitarChordLookup);
            guitarChordLookup = fixSuspendedChordName(guitarChordLookup);

            // const guitarChord = guitarChords[guitarChordLookup]?.[0];
            const guitarChord = chordMap.get(guitarChordLookup.toLowerCase());

            // 'C°7(addM7,11,b13)',
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
                {showPiano ? (
                  <div className="m-2 flex flex-col p-2">
                    <div className="flex justify-between font-semibold">
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
                        <p key={chord} className="text-sm text-blue-500">
                          {chord}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <ChordChart2 width={100} height={120} chord={guitarChord} />
                    <p className="text-center text-sm">{guitarChordLookup}</p>
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
