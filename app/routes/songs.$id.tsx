// app/routes/songs.$id.tsx

import { useEffect, useState } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  json,
  Link,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { editSong, useAppContext } from "~/context/AppContext";
import { readDataFile } from "~/files.server";
import clamp from "~/utils/clamp";
import { getChordPro } from "~/utils/getChordPro";
import { Chord } from "chordsheetjs";
import {
  ChevronDown,
  ChevronUp,
  Edit2Icon,
  EllipsisVertical,
  ListPlus,
  Minus,
  Plus,
} from "lucide-react";

import { useAutoCloseToast } from "~/hooks/useAutoCloseToast";
import useFirestore, { ISong } from "~/hooks/useFirestore";
import useSongs from "~/hooks/useSongs";
import useUserAppConfig from "~/hooks/useUserAppConfig";
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
import ChordTab, { GuitarChords } from "~/components/ChordTab";
import LinkButton from "~/components/LinkButton";
import LoadingIndicator from "~/components/LoadingIndicator";
import SelectPlaylist from "~/components/SelectPlaylist";
import SongRender from "~/components/SongRender";
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
  // const chordsData = (await readDataFile(
  //   "public/assets/chords/chords.json"
  // )) as ChordsData;

  const chordsData = (await readDataFile(
    "public/assets/chords/guitar.json"
  )) as GuitarChords;

  const headers = { "Cache-Control": "max-age=86400" }; // One day

  return json({ chords: chordsData }, { headers });
}

export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 24;
export const FONT_SIZE_STEP = 2;

export default function SongView() {
  const navigate = useNavigate();
  const params = useParams();
  const songIdParam = params.id;

  const data = useLoaderData<typeof loader>();

  const { dispatch } = useAppContext();

  const { autoCloseToast } = useAutoCloseToast();

  const { setSongPreferences } = useFirestore();

  const [song, setSong] = useState<ISong>();
  const songs = useSongs();
  const userAppConfig = useUserAppConfig();

  const [fontSize, setFontSize] = useState<number>(userAppConfig.fontSize);
  const [showTabs, setShowTabs] = useState(userAppConfig.showTablature);
  const [showPageTurner, setShowPageTurner] = useState(
    userAppConfig.enablePageTurner
  );

  const [content, setContent] = useState<string>("");
  const [transpose, setTranspose] = useState<number>(0);
  const [showAutoScrollSlider, setShowAutoScrollSlider] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(0);
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const [showPlaylistSelection, setShowPlaylistSelection] = useState(false);
  const [showPiano, setShowPiano] = useState(false);

  // read using the cache hook
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

  const onChangeShowTabs = async (value: boolean) => {
    setShowTabs(value);

    if (songIdParam && song) {
      await setSongPreferences(songIdParam, { showTablature: value });

      // update the song in redux with the preferences
      const newSong = { ...song };
      newSong.showTablature = value;
      dispatch(editSong(newSong));
    }
  };

  const onClickChord = (allChords: Chord[], chordString: string) => {
    const foundChord = allChords.find(c => c.toString() === chordString);
    if (foundChord) {
      setSelectedChord(foundChord);
    } else {
      autoCloseToast({
        autoCloseDelay: 2000,
        variant: "destructive",
        title: "Error",
        description: `${chordString} is not a valid chord`,
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
      dispatch(editSong(newSong));
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

  const changeFontSize = async (amount: number) => {
    const newFontSize = clamp(fontSize + amount, MIN_FONT_SIZE, MAX_FONT_SIZE);
    setFontSize(newFontSize);

    if (songIdParam && song) {
      await setSongPreferences(songIdParam, { fontSize: newFontSize });

      // update the song in redux with the preferences
      const newSong = { ...song };
      newSong.fontSize = newFontSize;
      dispatch(editSong(newSong));
    }
  };

  const increaseFontSize = async () => {
    await changeFontSize(FONT_SIZE_STEP);
  };

  const decreaseFontSize = async () => {
    await changeFontSize(-FONT_SIZE_STEP);
  };

  if (!content) {
    return <LoadingIndicator title={"No content."} />;
  }

  return (
    <div className="relative">
      <div className="mt-6 pb-4 pl-6">
        <Button asChild size="sm" variant="outline">
          <Link to={`/songs/${songIdParam}/edit`}>
            <Edit2Icon className="size-4" />
          </Link>
        </Button>
      </div>
      {/* Main content (song sheet) */}
      <div className="size-full">
        <SongTransformer
          chordProSong={content}
          transposeDelta={transpose}
          showTabs={showTabs}
          fontSize={fontSize}>
          {songProps => (
            <div className="flex flex-col pb-6 pl-6 font-mono">
              <SongRender
                onPressArtist={onPressArtist}
                onPressChord={chordString =>
                  onClickChord(songProps.chords, chordString)
                }
                song={songProps.transformedSong}
                scrollSpeed={scrollSpeed}
              />
              <LinkButton
                title={song?.external?.source}
                url={song?.external?.url}
              />
              <ChordTab
                guitarChords={data.chords}
                showPiano={showPiano}
                onPressClose={() => setSelectedChord(null)}
                selectedChord={selectedChord}
                allChords={songProps.chords}
                closeLabel={"Close"}
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

        <SheetContent
          side="right"
          className="flex w-56 flex-col space-y-4 p-4 md:w-56">
          <SheetHeader>
            <SheetTitle>Edit Settings</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

          {/* Settings Section */}
          <div className="grid grid-cols-2 items-center gap-4">
            {/* Transpose Section */}
            <h3 className="text-nowrap text-sm font-medium">Transpose</h3>
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
            <h3 className="text-nowrap text-sm font-medium">Font Size</h3>
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
              Show Tablature
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
              Show Page Turner
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
              {showPiano ? "Piano Notes" : "Guitar Tabs"}
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
              Add to Playlist
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
