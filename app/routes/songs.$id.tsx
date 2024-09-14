// app/routes/songs.$id.tsx

import fs from "fs";
import path from "path";
import { useEffect, useState } from "react";
import {
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { type loader as parentLoader } from "~/root";
import { getChordPro } from "~/utils/getChordPro";
import { Chord } from "chordsheetjs";
import {
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  ListPlus,
  Minus,
  Plus,
} from "lucide-react";

import { useAutoCloseToast } from "~/hooks/useAutoCloseToast";
import { ISong } from "~/hooks/useFirestore";
import { useFirestoreQueryCache } from "~/hooks/useFirestoreQueryCache";
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
import ChordTab, { ChordsData } from "~/components/ChordTab";
import LinkButton from "~/components/LinkButton";
import { LoadingSpinner } from "~/components/loading-spinner";
import SelectPlaylist from "~/components/SelectPlaylist";
import SongRender from "~/components/SongRender";
import SongTransformer from "~/components/SongTransformer";
import styles from "~/styles/chordsheetjs.css?url";

export const meta: MetaFunction = () => [
  // your meta here
  { title: "Song" },
  { name: "description", content: "View Song" },
];

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

// Loader function to fetch the JSON data
export const loader: LoaderFunction = async () => {
  // Get the absolute path to the chords.json file
  const filePath = path.resolve("public/assets/chords/chords.json");

  // Read the file
  const fileContents = fs.readFileSync(filePath, "utf-8");

  // Parse the JSON
  const guitarChords: ChordsData = JSON.parse(fileContents);

  return json(guitarChords);
};

export default function SongView() {
  const navigate = useNavigate();
  const params = useParams();
  const rootLoaderData = useRouteLoaderData<typeof parentLoader>("root");
  const userId = rootLoaderData?.decodedClaims?.uid;
  const guitarChords = useLoaderData<ChordsData>(); // Retrieve the data from the loader

  const { autoCloseToast } = useAutoCloseToast();

  const [song, setSong] = useState<ISong>();

  const [fontSize, setFontSize] = useState<number>(12);
  const [showTabs, setShowTabs] = useState(false);
  const [showPageTurner, setShowPageTurner] = useState(false);

  const [content, setContent] = useState<string>("");
  const [transpose, setTranspose] = useState<number>(0);
  const [showAutoScrollSlider, setShowAutoScrollSlider] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(0);
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const [showPlaylistSelection, setShowPlaylistSelection] = useState(false);
  const [showPiano, setShowPiano] = useState(true);

  const { documents: songs } = useFirestoreQueryCache(userId);
  // const songs = useSongs();

  // read using the cache hook
  useEffect(() => {
    if (!songs) return;

    // Find the song by ID in the cached data
    const foundSong = songs.find(s => s.id === params.id);
    setSong(foundSong);
  }, [songs, params.id]);

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

  const handleTranspose = (direction: "up" | "down") => {
    const newTranspose = direction === "up" ? transpose + 1 : transpose - 1;
    setTranspose(newTranspose);
  };

  const handleFontSize = (direction: "increase" | "decrease") => {
    setFontSize(prev =>
      direction === "increase" ? prev + 1 : Math.max(prev - 1, 8)
    );
  };

  if (!content) {
    return (
      <div className="mx-auto mt-6 flex items-center justify-center">
        <LoadingSpinner className="mr-2 size-4" />
        <h1>No content.</h1>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main content (song sheet) */}
      <div className="size-full">
        <SongTransformer
          chordProSong={content}
          transposeDelta={transpose}
          showTabs={showTabs}
          fontSize={fontSize}>
          {songProps => (
            <div className="mt-6 flex flex-col pb-6 pl-6 font-mono">
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
                guitarChords={guitarChords}
                showPiano={showPiano}
                onPressClose={() => setSelectedChord(null)}
                selectedChord={selectedChord}
                allChords={songProps.chords}
                closeLabel={"Close"}
              />
              <SelectPlaylist
                songId={params.id}
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
              <Button
                onClick={() => handleTranspose("down")}
                size="sm"
                variant="outline">
                <Minus className="size-4" />
              </Button>
              <span className="flex w-8 items-center justify-center">
                {transpose}
              </span>
              <Button
                onClick={() => handleTranspose("up")}
                size="sm"
                variant="outline">
                <Plus className="size-4" />
              </Button>
            </div>

            {/* Font Size Section */}
            <h3 className="text-nowrap text-sm font-medium">Font Size</h3>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => handleFontSize("decrease")}
                size="sm"
                variant="outline">
                <ChevronDown className="size-4" />
              </Button>
              <span className="flex w-8 items-center justify-center">
                {fontSize}
              </span>
              <Button
                onClick={() => handleFontSize("increase")}
                size="sm"
                variant="outline">
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
                onCheckedChange={setShowTabs}
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
