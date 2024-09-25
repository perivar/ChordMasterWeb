import { FunctionComponent } from "react";
import Chord from "@techies23/react-chords";

import { ChordElement, ChordPosition } from "./ChordTab";

interface Props {
  chord?: ChordElement;
  tuning?: string[];
  lite?: boolean;
}

// const convertChord = (chord?: {
//   positions: string[]; // ['5', '7']
//   fingerings: string[][]; // [ ['0', '0'], ['1', '1'] ]
// }) => {
//   // Handle undefined chord case by returning default frets and fingers
//   if (!chord) {
//     return {
//       frets: [-1, -1, -1, -1, -1, -1], // All muted strings
//       fingers: [0, 0, 0, 0, 0, 0], // All open strings
//     };
//   }

//   const { positions, fingerings } = chord;

//   // Convert positions to frets array, where:
//   // - 'x' becomes -1 (non-used)
//   // - other values are parsed as integers
//   const frets = positions.map(pos => (pos === "x" ? -1 : parseInt(pos)));

//   // Convert fingerings to fingers array, where:
//   // - '0' means open string
//   // - Any other number is kept as is (finger 1 - 4)
//   const fingers = fingerings[0].map(finger => parseInt(finger) || 0);

//   return { frets, fingers };
// };

const ChordChart2: FunctionComponent<Props> = ({
  chord,
  tuning = ["E", "A", "D", "G", "B", "E"],
  lite = false, // defaults to false if omitted
}) => {
  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: "Guitar",
    keys: [],
    tunings: {
      standard: tuning,
    },
  };

  // Find the position with the lowest baseFret or return a default chord if not found
  const defaultChordPosition: ChordPosition = {
    frets: [],
    fingers: [],
    baseFret: 1,
    barres: [],
    capo: false,
    midi: [],
  };
  const chordElement = chord?.positions[0] ?? defaultChordPosition;

  return (
    <div className="min-w-36">
      <Chord chord={chordElement} instrument={instrument} lite={lite} />
    </div>
  );
};

export default ChordChart2;
