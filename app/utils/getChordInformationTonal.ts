import { Chord as ChordTonal, Note as NoteTonal } from "@tonaljs/tonal";

import { ChordInformation } from "./getChordInformation";

export const getChordInformationTonal = (value: string): ChordInformation => {
  let isChord: boolean = false;
  const chordName: string = value;

  let notes: string[] = [];
  let intervals: string[] = [];
  let rootNote: string | undefined;
  let bassNote: string | undefined;

  let error: unknown;

  // store chord name in note string
  let noteString = value;

  try {
    // @tonaljs does not support base notes, so extract from string before using
    // retrieve potential base note from chord
    if (noteString.includes("/")) {
      const split = noteString.split("/");
      noteString = split[0];
      bassNote = split[1];
    }

    // get notes for this chord
    const chordTonal = ChordTonal.get(noteString);
    if (!chordTonal.empty) {
      isChord = true;
      rootNote = chordTonal.tonic ?? undefined;
      notes = chordTonal.notes ?? [];
      intervals = chordTonal.intervals ?? [];
    }

    // normalize note names
    // like Fb to E and C## to D
    // tonal calls this simplify
    notes = notes.map(note => {
      const normalizedChord = NoteTonal.simplify(note);
      return normalizedChord;
    });
  } catch (e) {
    error = e;
  }

  return {
    isChord,
    chordName,
    rootNote,
    bassNote,
    intervals,
    notes,
    error,
  };
};
