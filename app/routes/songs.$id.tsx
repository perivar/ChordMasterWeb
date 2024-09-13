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
  Link,
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
  Minus,
  Plus,
} from "lucide-react";

import { useAutoCloseToast } from "~/hooks/use-auto-close-toast";
import { ISong } from "~/hooks/useFirestore";
import { useFirestoreCache } from "~/hooks/useFirestoreCache";
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
import { LoadingSpinner } from "~/components/loading-spinner";
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

  const { documents } = useFirestoreCache(userId);
  const { autoCloseToast } = useAutoCloseToast();

  const [song, setSong] = useState<ISong>();

  const [fontSize, setFontSize] = useState<number>(12);
  const [showTabs, setShowTabs] = useState(true);
  const [showPageTurner, setShowPageTurner] = useState(true);

  const [content, setContent] = useState<string>("");
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [transpose, setTranspose] = useState<number>(0);
  const [showAutoScrollSlider, setShowAutoScrollSlider] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(0);
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
  const [showPlaylistSelection, setShowPlaylistSelection] = useState(false);
  const [showPiano, setShowPiano] = useState(true);

  // read using the cache hook
  useEffect(() => {
    if (!documents) return;

    // Find the song by ID in the cached data
    const foundSong = documents.find(s => s.id === params.id);
    setSong(foundSong);
  }, [documents, params.id]);

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
              <ChordTab
                guitarChords={guitarChords}
                showPiano={showPiano}
                onPressClose={() => setSelectedChord(null)}
                selectedChord={selectedChord}
                allChords={songProps.chords}
                closeLabel={"Close"}
              />
              <div className="mt-4">
                {song?.external?.url && (
                  <Link to={song?.external?.url}>{song?.external?.source}</Link>
                )}
              </div>
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

        {/* Sheet Content (right panel) */}
        <SheetContent side="right" className="w-64 space-y-4 p-4 md:w-72">
          <SheetHeader>
            <SheetTitle>Edit Settings</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          {/* Sheet content */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Transpose</h3>
            <div className="flex space-x-2">
              <Button onClick={() => handleTranspose("down")} size="sm">
                <ChevronDown className="size-4" />
              </Button>
              <span className="flex w-8 items-center justify-center">
                {transpose}
              </span>
              <Button onClick={() => handleTranspose("up")} size="sm">
                <ChevronUp className="size-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Font Size</h3>
            <div className="flex space-x-2">
              <Button onClick={() => handleFontSize("decrease")} size="sm">
                <Minus className="size-4" />
              </Button>
              <span className="flex w-8 items-center justify-center">
                {fontSize}
              </span>
              <Button onClick={() => handleFontSize("increase")} size="sm">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="chord-type"
                checked={showPiano}
                onCheckedChange={setShowPiano}
              />
              <Label htmlFor="chord-type">
                {showPiano ? "Piano Notes" : "Guitar Tabs"}
              </Label>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
