import {
  ARTIST,
  COMMENT,
  START_OF_CHORUS,
  START_OF_VERSE,
  TITLE,
} from "~/utils/ChordSheetConstants";
import ChordSheetJS, { ChordLyricsPair, Song } from "chordsheetjs";

interface Props {
  song: Song;
  onPressChord?: (chord: string) => void;
  onPressArtist?: () => void;
  scrollSpeed?: number;
}

// Main component for rendering the chord sheet
const SongRender = (props: Props) => {
  const handleChordClick = (chord: string) => {
    if (props.onPressChord) {
      props.onPressChord(chord);
    }
  };

  // Parse the chord sheet
  // const parser = new ChordSheetJS.ChordProParser();
  // const song: Song = parser.parse(props.song);
  const song = props.song;

  // Function to render a single ChordLyricsPair (handling both chords and lyrics)
  const renderChordLyricsPair = (item: ChordLyricsPair, key: string) => {
    let { lyrics } = item;
    if (lyrics && lyrics.length <= item.chords.length) {
      lyrics = lyrics + " ".repeat(item.chords.length - lyrics.length + 1);
    }

    return (
      <div className="column" key={key}>
        {item.chords ? (
          <div
            role="button"
            tabIndex={0}
            onKeyDown={() => {}}
            className="chord"
            onClick={() => handleChordClick(item.chords)}>
            {item.chords}
          </div>
        ) : (
          <div className="chord"></div>
        )}
        {<div className="lyrics">{item.lyrics}</div>}
      </div>
    );
  };

  // Function to render the parsed song
  const renderSong = () => {
    return song.lines.map((line, lineIndex) => (
      <div key={lineIndex} className="row">
        {line.items.map((item, itemIndex) => {
          const key = `${lineIndex}${itemIndex}`;
          if (item instanceof ChordSheetJS.ChordLyricsPair) {
            return renderChordLyricsPair(item, key);
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === TITLE
          ) {
            return (
              <div key={key} className="title">
                {item.value}
              </div>
            );
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === ARTIST
          ) {
            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                onKeyDown={() => {}}
                className="artist"
                onClick={props.onPressArtist}>
                {item.value}
              </div>
            );
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === START_OF_VERSE
          ) {
            return (
              <div key={key} className="comment">
                {"Verse"} {item.value ?? ""}
              </div>
            );
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === START_OF_CHORUS
          ) {
            return (
              <div key={key} className="comment">
                {"Chorus"} {item.value ?? ""}
              </div>
            );
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.name === COMMENT
          ) {
            // tag comments have name 'comment' and the comment as value
            return (
              <div key={key} className="comment">
                {item.value}
              </div>
            );
          } else if (
            item instanceof ChordSheetJS.Tag &&
            item.name &&
            item.value &&
            item.value !== null
          ) {
            return (
              <div key={key}>
                <div className="meta-label">{item.name}</div>
                <div className="meta-value">{item.value}</div>
              </div>
            );
          } else {
            // ignore
            return <div key={key}>{item.toString()}</div>;
          }
        })}
      </div>
    ));
  };

  return (
    <div className="chord-sheet">
      <div>{renderSong()}</div>
    </div>
  );
};

export default SongRender;
