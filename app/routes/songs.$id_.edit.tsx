// app/routes/songs.$id.edit.tsx

import { useEffect, useState } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import { Form, useNavigate, useParams } from "@remix-run/react";
import {
  addOrUpdateArtistReducer,
  addOrUpdateSongReducer,
  useAppContext,
} from "~/context/AppContext";
import { useUser } from "~/context/UserContext";
import CustomUltimateGuitarFormatter from "~/utils/CustomUltimateGuitarFormatter";
import CustomUltimateGuitarParser from "~/utils/CustomUltimateGuitarParser";
import ChordSheetJS from "chordsheetjs";
import { useTranslation } from "react-i18next";

import useFirestore, { IArtist } from "~/hooks/useFirestore";
import useFirestoreMethods from "~/hooks/useFirestoreMethods";
import useSongs from "~/hooks/useSongs";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import LoadingIndicator from "~/components/LoadingIndicator";
import styles from "~/styles/chordsheetjs.css?url";

export const meta: MetaFunction = () => [
  { title: "Song" },
  { name: "description", content: "Edit Song" },
];

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function SongEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  let songIdParam = params?.id;

  const { dispatch } = useAppContext();
  const { user } = useUser();
  const allSongs = useSongs();
  const song = allSongs.find(s => s.id === songIdParam);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [content, setContent] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [error, setError] = useState<string | null>();
  const { addNewSong, editSong, getArtistsByName, addNewArtist } =
    useFirestore();
  const { isLoading, loadSongData } = useFirestoreMethods();

  const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceFromText, setReplaceFromText] = useState("");
  const [replaceWithText, setReplaceWithText] = useState("");
  const [isChordModalOpen, setChordModalOpen] = useState(false);
  const [addChordText, setAddChordText] = useState("");

  // const [activeTab, setActiveTab] = useState("chordpro");
  const [mode, setMode] = useState<"CHORD_PRO" | "CHORD_SHEET">("CHORD_PRO");

  useEffect(() => {
    if (songIdParam && songIdParam !== "new") {
      loadSongData(songIdParam);
    }
  }, [songIdParam]);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist.name);
      setContent(removeMetaTags(song.content));

      setSourceLabel(song.external.source ?? "");
      setSourceUrl(song.external.url ?? "");
    }
  }, [song]);

  const removeMetaTags = (text: string) => {
    text = text.replace(/{title:[^}]+}\n?/g, "");
    text = text.replace(/{t:[^}]+}\n?/g, "");
    text = text.replace(/{artist:[^}]+}\n?/g, "");
    text = text.replace(/{a:[^}]+}\n?/g, "");
    return text;
  };

  // ------
  const handleReplaceText = () => {
    if (replaceFromText) {
      const newContent = content.split(replaceFromText).join(replaceWithText);
      setContent(newContent);
      setReplaceModalOpen(false);
    }
  };

  const handleAddChord = () => {
    if (addChordText) {
      // const newContent =
      //   content.slice(0, selection.start) +
      //   `[${addChordText}]` +
      //   content.slice(selection.end);
      // setContent(newContent);
      setChordModalOpen(false);
    }
  };

  const handleSaveSong = async () => {
    if (title.trim() === "") return setError("Invalid Title");
    if (artist.trim() === "") return setError("Invalid Artist");
    if (content.trim() === "") return setError("Invalid Content");

    const artistName = artist.trim();
    const songTitle = title.trim();
    let chordPro = content;

    const srcLabel = sourceLabel.trim();
    const srcUrl = sourceUrl.trim();

    if (mode === "CHORD_SHEET") {
      // original parser:
      // let chordSheetSong = new ChordSheetJS.ChordSheetParser({
      //   preserveWhitespace: false,
      // }).parse(content);

      // using custom ultimate guitar parser instead of the ChordSheet parser
      const chordSheetSong = new CustomUltimateGuitarParser({
        preserveWhitespace: false,
      }).parse(content);

      // Tested out ChordsOverWordsParser, but disabled for now:
      // let chordSheetSong = new ChordsOverWordsParser().parse(content);

      chordPro = new ChordSheetJS.ChordProFormatter().format(chordSheetSong);
    }

    let artistDb: IArtist;
    const artists = await getArtistsByName(artistName);
    if (artists && artists.length > 0) {
      artistDb = artists[0];
    } else {
      artistDb = await addNewArtist(artistName);
      await dispatch(addOrUpdateArtistReducer(artistDb));
    }

    if (songIdParam && songIdParam !== "new") {
      try {
        const updatedSong = await editSong(
          songIdParam,
          {
            id: artistDb.id,
            name: artistDb.name,
          },
          songTitle,
          chordPro,

          song?.external?.id,
          srcUrl ?? "",
          srcLabel ?? ""
        );

        // console.log('SongEdit -> editSong:', updatedSong);
        songIdParam = updatedSong.id;

        await dispatch(addOrUpdateSongReducer(updatedSong));
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          throw e;
        }
      }
    } else {
      try {
        const newSong = await addNewSong(
          {
            uid: user?.uid!,
            email: user?.email!,
            displayName: user?.displayName!,
          },
          {
            id: artistDb.id,
            name: artistDb.name,
          },
          songTitle,
          chordPro,

          "",
          srcUrl ?? "",
          srcLabel ?? ""
        );

        // console.log('SongEdit -> addNewSong:', newSong);
        songIdParam = newSong.id;

        await dispatch(addOrUpdateSongReducer(newSong));
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          throw e;
        }
      }
    }

    navigate(`/songs/${songIdParam}`);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  const handleTabChange = (value: string) => {
    if (value === "chordpro") {
      switchToChordPro();
    } else {
      switchToChordSheet();
    }
  };

  const switchToChordPro = () => {
    try {
      // original parser:
      // let s = new ChordSheetJS.ChordSheetParser({
      //   preserveWhitespace: false,
      // }).parse(content);

      // using custom ultimate guitar parser instead of the ChordSheet parser
      const s = new CustomUltimateGuitarParser({
        preserveWhitespace: false,
      }).parse(content);

      // Tested out ChordsOverWordsParser, but disabled for now:
      // let s = new ChordsOverWordsParser().parse(content);

      // console.log('switchToChordPro:', s);
      const chordPro = new ChordSheetJS.ChordProFormatter().format(s);

      // console.log(chordPro);
      setContent(chordPro);
      setMode("CHORD_PRO");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  };

  const switchToChordSheet = () => {
    try {
      const s = new ChordSheetJS.ChordProParser().parse(content);
      // console.log('switchToChordSheet:', JSON.stringify(s, null, 2));

      // original text formatter
      // let plainText = new ChordSheetJS.TextFormatter().format(s);

      // use custom ultimate guitar formatter instead of the plaintext formatter
      const plainText = new CustomUltimateGuitarFormatter().format(s);

      // console.log(plainText);
      setContent(plainText);
      setMode("CHORD_SHEET");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  };

  const contentPlaceholder =
    mode === "CHORD_PRO"
      ? "You can edit any song here\n" +
        "U[C]sing the [Dm]chordPro format[G]\n\n\n"
      : "You can edit any song here\n" +
        " C              Dm          G\n" +
        "Using the chord sheet format\n\n\n";

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="mx-auto grid w-full p-4">
      {error && <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>}

      <Form id="edit-form">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="song-title">Song Title</Label>
            <Input
              id="song-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter song title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist-name">Artist Name</Label>
            <Input
              id="artist-name"
              value={artist}
              onChange={e => setArtist(e.target.value)}
              placeholder="Enter artist name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-label">Source Label</Label>
            <Input
              id="source-label"
              value={sourceLabel}
              onChange={e => setSourceLabel(e.target.value)}
              placeholder="Enter source label"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-url">Source URL</Label>
            <Input
              id="source-url"
              type="url"
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder="Enter source URL"
            />
          </div>
        </div>
        <Tabs
          defaultValue="chordpro"
          className="w-full"
          onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              value="chordpro">
              ChordPro
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              value="chords-over-lyrics">
              Chords Over Lyrics
            </TabsTrigger>
          </TabsList>

          <Textarea
            placeholder={contentPlaceholder}
            value={content}
            onChange={handleContentChange}
            className="mt-4 min-h-[350px] font-mono"
          />
        </Tabs>

        <Button className="mt-4" onClick={handleSaveSong}>
          {"Save Song"}
        </Button>
      </Form>

      <Dialog
        open={isReplaceModalOpen}
        onOpenChange={() => setReplaceModalOpen(false)}>
        <DialogContent>
          <Label htmlFor="replace-text">Replace From</Label>
          <Input
            id="replace-text"
            value={replaceFromText}
            onChange={e => setReplaceFromText(e.target.value)}
          />
          <Label htmlFor="replace-with">Replace From</Label>
          <Input
            id="replace-with"
            value={replaceWithText}
            onChange={e => setReplaceWithText(e.target.value)}
          />
          <Button onClick={handleReplaceText}>{"Replace"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isChordModalOpen}
        onOpenChange={() => setChordModalOpen(false)}>
        <DialogContent>
          <Label htmlFor="add-chord">Add Chord</Label>
          <Input
            id="add-chord"
            value={addChordText}
            onChange={e => setAddChordText(e.target.value)}
          />
          <Button onClick={handleAddChord}>{"Add"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
