declare module "ChordModule" {
  type ChordType = {
    frets: number[];
    barres?: number[];
    capo?: boolean;
    fingers?: number[];
    baseFret: number;
  };

  type InstrumentType = {
    tunings: {
      standard: string[];
    };
    strings: number;
    fretsOnChord: number;
  };

  type ChordProps = {
    chord: ChordType;
    instrument: InstrumentType;
    lite?: boolean;
    dark?: boolean;
  };
}
