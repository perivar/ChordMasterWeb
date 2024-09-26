import { FunctionComponent } from "react";

import { ChordElement, ChordPosition } from "./ChordTab";
import Chord from "./react-chords";

interface Props {
  chord?: ChordElement;
  tuning?: string[];
  lite?: boolean;
}

const ChordChart: FunctionComponent<Props> = ({
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

export default ChordChart;
