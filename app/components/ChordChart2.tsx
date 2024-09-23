import { FunctionComponent } from "react";
import Chord from "@techies23/react-chords";

interface Props {
  height?: number;
  width?: number;
  chord: {
    positions: string[]; // ['5', '7']
    fingerings: string[][]; // [ ['0', '0'], ['1', '1'] ]
  };
  showTuning?: boolean;
  tuning?: string[];
}

const convertChord = (chord?: {
  positions: string[]; // ['5', '7']
  fingerings: string[][]; // [ ['0', '0'], ['1', '1'] ]
}) => {
  // Handle undefined chord case by returning default frets and fingers
  if (!chord) {
    return {
      frets: [-1, -1, -1, -1, -1, -1], // All muted strings
      fingers: [0, 0, 0, 0, 0, 0], // All open strings
    };
  }

  const { positions, fingerings } = chord;

  // Convert positions to frets array, where:
  // - 'x' becomes -1 (non-used)
  // - other values are parsed as integers
  const frets = positions.map(pos => (pos === "x" ? -1 : parseInt(pos)));

  // Convert fingerings to fingers array, where:
  // - '0' means open string
  // - Any other number is kept as is (finger 1 - 4)
  const fingers = fingerings[0].map(finger => parseInt(finger) || 0);

  return { frets, fingers };
};

const ChordChart2: FunctionComponent<Props> = ({
  width = 100,
  height = 120,
  showTuning = false,
  tuning = ["E", "A", "D", "G", "B", "E"],
  chord,
}) => {
  const chord_tmp = {
    // which fret is which finger at. 1 - 4 or, 0 = open, -1 = non-used
    frets: [0, 4, 2, 3, -1, -1],
    // fingers 0 - 4
    fingers: [0, 3, 4, 1, 0, 0],
    barres: [4], // which fret is the barre? (2-4)
    capo: true, // whether the barres overlaps the whole fretboard
    baseFret: undefined, // fret to start (number), normally undefined
  };
  const chord2 = convertChord(chord);
  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: "Guitar",
    keys: [],
    tunings: {
      standard: tuning,
    },
  };
  const lite = false; // defaults to false if omitted

  return (
    <div className="min-w-36">
      <Chord chord={chord2} instrument={instrument} lite={lite} />
    </div>
  );
};

export default ChordChart2;
