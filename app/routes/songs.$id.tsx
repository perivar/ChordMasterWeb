// app/routes/songs.$id.tsx

import { useEffect, useState } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  json,
  Link,
  useLoaderData,
  useNavigate,
  useParams,
  useSubmit,
} from "@remix-run/react";
import { USER_APP_DEFAULTS } from "~/constants/defaults";
import { editSongReducer, useAppContext } from "~/context/AppContext";
import { readDataFile } from "~/files.server";
import clamp from "~/utils/clamp";
import { getChordPro } from "~/utils/getChordPro";
import { Chord } from "chordsheetjs";
import {
  ChevronDown,
  ChevronUp,
  Edit2Icon,
  EllipsisVertical,
  FileMusicIcon,
  ListPlus,
  Minus,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { ISong } from "~/lib/firestoreQueries";
import useFirestore from "~/hooks/useFirestore";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/components/ui/use-toast";
import ChordTab, { GuitarChords } from "~/components/ChordTab";
import LinkButton from "~/components/LinkButton";
import LoadingIndicator from "~/components/LoadingIndicator";
import SelectPlaylist from "~/components/SelectPlaylist";
import SongRender, {
  FONT_SIZES,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
} from "~/components/SongRender";
import SongTransformer from "~/components/SongTransformer";
import styles from "~/styles/chordsheetjs.css?url";

export const meta: MetaFunction = () => [
  { title: "Song" },
  { name: "description", content: "View Song" },
];

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export async function loader() {
  // originally from: https://github.com/artutra/OpenChord/tree/master/app/assets/chords
  // better? : https://github.com/T-vK/chord-collection
  // newer? : https://github.com/tombatossals/chords-db and https://tombatossals.github.io/react-chords/
  // https://github.com/techies23/react-chords

  const chordsData = (await readDataFile(
    "public/assets/chords/guitar.json"
  )) as GuitarChords;

  const headers = { "Cache-Control": "max-age=86400" }; // One day

  return json({ chords: chordsData }, { headers });
}

export default function SongView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const songIdParam = params.id;

  const data = useLoaderData<typeof loader>();

  const { toast } = useToast();
  const submit = useSubmit();

  const { setSongPreferences } = useFirestore();

  const { state, dispatch } = useAppContext();
  const songs = state.songs;
  const userAppConfig = state.userAppConfig;

  const [song, setSong] = useState<ISong>();
  const [fontSize, setFontSize] = useState<number>(userAppConfig.fontSize);
  const [showTabs, setShowTabs] = useState(userAppConfig.showTablature);
  const [showPageTurner, setShowPageTurner] = useState(
    userAppConfig.enablePageTurner
  );

  const [content, setContent] = useState<string>("");
  const [transpose, setTranspose] = useState<number>(0);
  // const [showAutoScrollSlider, setShowAutoScrollSlider] = useState(false);
  const [scrollSpeed, _setScrollSpeed] = useState<number>(0);
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const [showPlaylistSelection, setShowPlaylistSelection] = useState(false);
  const [showPiano, setShowPiano] = useState(true);

  useEffect(() => {
    if (!songs) return;

    // Find the song by ID in the cached data
    const foundSong = songs.find(s => s.id === songIdParam);
    setSong(foundSong);
  }, [songs, songIdParam]);

  useEffect(() => {
    if (song) {
      setContent(getChordPro(song));

      if (song.transposeAmount !== undefined) {
        setTranspose(song.transposeAmount);
      }

      if (song.fontSize !== undefined) {
        setFontSize(song.fontSize);
      }

      if (song.showTablature !== undefined) {
        setShowTabs(song.showTablature);
      }
    }
  }, [song]);

  const onPressPDF = async () => {
    if (songIdParam && song) {
      const formData = new FormData();
      formData.append("id", song.id || "");
      formData.append("title", song.title);
      formData.append("chordpro", song.content);
      formData.append("transpose", String(song.transposeAmount || 0)); // Default to 0 if undefined
      formData.append(
        "font",
        String(song.fontSize || USER_APP_DEFAULTS.fontSize)
      );

      const response = await fetch("/action/get-pdf", {
        method: "POST",
        body: formData,
      });

      // Convert the response to a Blob
      const blob = await response.blob();

      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Open the PDF in a new browser tab
      window.open(url, "_blank");

      // Or download the url instead
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = "chordsheet.pdf"; // Set the file name
      // document.body.appendChild(a);
      // a.click();
      // a.remove();
    }
  };

  const onChangeShowTabs = async (value: boolean) => {
    setShowTabs(value);

    if (songIdParam && song) {
      await setSongPreferences(songIdParam, { showTablature: value });

      // update the song in redux with the preferences
      const newSong = { ...song };
      newSong.showTablature = value;
      dispatch(editSongReducer(newSong));
    }
  };

  const onClickChord = (allChords: Chord[], chordString: string) => {
    const foundChord = allChords.find(c => c.toString() === chordString);
    if (foundChord) {
      setSelectedChord(foundChord);
    } else {
      toast({
        title: "Error",
        description: `${chordString} is not a valid chord`,
        duration: 2000,
        variant: "destructive",
      });

      setSelectedChord(null);
    }
  };

  const onPressArtist = () => {
    navigate(`/artists/${song?.artist.id}`);
  };

  const changeTranspose = async (amount: number) => {
    setTranspose(amount);
    if (songIdParam && song) {
      await setSongPreferences(songIdParam, { transposeAmount: amount });

      // update the song in redux with the preferences
      const newSong = { ...song };
      newSong.transposeAmount = amount;
      dispatch(editSongReducer(newSong));
    }
  };

  const transposeUp = () => {
    changeTranspose(transpose + 1 >= 12 ? 0 : transpose + 1);
    setSelectedChord(null);
  };

  const transposeDown = () => {
    changeTranspose(transpose - 1 <= -12 ? 0 : transpose - 1);
    setSelectedChord(null);
  };

  const changeFontSizeIndex = async (amount: number) => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    const newIndex = currentIndex + amount;

    // Check bounds to ensure the new index is valid
    if (newIndex >= 0 && newIndex < FONT_SIZES.length) {
      let newFontSize = FONT_SIZES[newIndex];

      // Ensure that newFontSize does not exceed the min and max limits
      newFontSize = clamp(newFontSize, MIN_FONT_SIZE, MAX_FONT_SIZE);
      setFontSize(newFontSize);

      if (songIdParam && song) {
        await setSongPreferences(songIdParam, { fontSize: newFontSize });

        // update the song in redux with the preferences
        const newSong = { ...song };
        newSong.fontSize = newFontSize;
        dispatch(editSongReducer(newSong));
      }
    }
  };

  const increaseFontSize = async () => {
    await changeFontSizeIndex(1); // Increment the font size index
  };

  const decreaseFontSize = async () => {
    await changeFontSizeIndex(-1); // Decrement the font size index
  };

  if (!content) {
    return <LoadingIndicator title={t("no_content_found")} />;
  }

  return (
    <div className="relative">
      <div className="mt-6 pb-4 pl-6">
        <Button asChild size="sm" variant="outline">
          <Link to={`/songs/${songIdParam}/edit`}>
            <Edit2Icon className="size-4" />
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onPressPDF}
          className="ml-4">
          <FileMusicIcon className="size-4" />
        </Button>
      </div>
      {/* Main content (song sheet) */}
      <div className="size-full pb-96">
        <SongTransformer
          chordProSong={content}
          transposeDelta={transpose}
          showTabs={showTabs}>
          {songProps => (
            <div className="flex flex-col pb-6 pl-6 font-mono">
              <SongRender
                onPressArtist={onPressArtist}
                onPressChord={chordString =>
                  onClickChord(songProps.chords, chordString)
                }
                song={songProps.transformedSong}
                fontSize={fontSize}
                scrollSpeed={scrollSpeed}
              />
              {/* Testing out the PDF Rendering */}
              {/* <SongPDFRender
                song={songProps.transformedSong}
                fontSize={fontSize}
              /> */}

              <LinkButton
                title={song?.external?.source}
                url={song?.external?.url}
              />
              <ChordTab
                guitarChords={data.chords}
                showPiano={showPiano}
                onShowChange={setShowPiano}
                showChangeLabel={
                  showPiano ? t("show_guitar_tabs") : t("show_piano_notes")
                }
                selectedChord={selectedChord}
                allChords={songProps.chords}
                onPressClose={() => setSelectedChord(null)}
                closeLabel={t("close")}
              />
              <SelectPlaylist
                songId={songIdParam}
                show={showPlaylistSelection}
                onPressClose={() => setShowPlaylistSelection(false)}
              />
            </div>
          )}
        </SongTransformer>
      </div>

      {/* Right panel (Sheet component for overlay) */}
      <Sheet>
        {/* Sheet Trigger Button (always visible at top right) */}
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed right-4 top-20 z-30">
            <EllipsisVertical className="size-4" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="flex w-auto flex-col space-y-4">
          <SheetHeader>
            <SheetTitle>{t("settings")}</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

          {/* Settings Section */}
          <div className="grid grid-cols-2 items-center gap-4">
            {/* Transpose Section */}
            <h3 className="text-nowrap text-sm font-medium">
              {t("transpose")}
            </h3>
            <div className="flex justify-end space-x-2">
              <Button onClick={transposeDown} size="sm" variant="outline">
                <Minus className="size-4" />
              </Button>
              <span className="flex w-8 items-center justify-center">
                {transpose}
              </span>
              <Button onClick={transposeUp} size="sm" variant="outline">
                <Plus className="size-4" />
              </Button>
            </div>

            {/* Font Size Section */}
            <h3 className="text-nowrap text-sm font-medium">
              {t("text_size")}
            </h3>
            <div className="flex justify-end space-x-2">
              <Button onClick={decreaseFontSize} size="sm" variant="outline">
                <ChevronDown className="size-4" />
              </Button>
              <span className="flex w-8 items-center justify-center">
                {fontSize}
              </span>
              <Button onClick={increaseFontSize} size="sm" variant="outline">
                <ChevronUp className="size-4" />
              </Button>
            </div>

            {/* Show Tablature Section */}
            <Label
              htmlFor="show-tablature"
              className="text-nowrap text-sm font-medium">
              {showTabs ? t("show_tabs_by_default") : t("hide_tabs_by_default")}
            </Label>
            <div className="flex justify-end">
              <Switch
                id="show-tablature"
                checked={showTabs}
                onCheckedChange={onChangeShowTabs}
              />
            </div>

            {/* Show Page Turner Section */}
            <Label
              htmlFor="show-pageturner"
              className="text-nowrap text-sm font-medium">
              {showPageTurner
                ? t("enable_page_turner_by_default")
                : t("disable_page_turner_by_default")}
            </Label>
            <div className="flex justify-end">
              <Switch
                id="show-pageturner"
                checked={showPageTurner}
                onCheckedChange={setShowPageTurner}
              />
            </div>

            {/* Chord Type Section */}
            <Label
              htmlFor="chord-type"
              className="text-nowrap text-sm font-medium">
              {showPiano ? t("show_piano_notes") : t("show_guitar_tabs")}
            </Label>
            <div className="flex justify-end">
              <Switch
                id="chord-type"
                checked={showPiano}
                onCheckedChange={setShowPiano}
              />
            </div>

            {/* Add to Playlist Section */}
            <Label className="text-nowrap text-sm font-medium">
              {t("add_to_playlist")}
            </Label>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowPlaylistSelection(true)}
                size="sm"
                variant="outline">
                <ListPlus className="size-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
