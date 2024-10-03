// app/routes/online._index.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useUser } from "~/context/UserContext";

import useFirestore, { ISong } from "~/hooks/useFirestore";
import EmptyListMessage from "~/components/EmptyListMessage";
import LoadingIndicator from "~/components/LoadingIndicator";
import SortableList from "~/components/SortableList";

export const meta: MetaFunction = () => [
  { title: "Online Search" },
  { name: "description", content: "Online Search" },
];

export default function OnlineSearchView() {
  const [limitCount] = useState<number | undefined>(undefined); // 20
  const [invertOwner] = useState(true); // change the behavior to the exact opposite, only get songs that the userId does not own
  const [onlyPublished] = useState(true); // only include published songs
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useUser();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [allSongs, setAllSongs] = useState<ISong[]>();
  const [songs, setSongs] = useState<ISong[]>(allSongs ?? []);

  const { getSongsByUserId } = useFirestore();

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = useCallback(async () => {
    if (user && user.uid) {
      setIsLoading(true);
      console.log(`Loading ${limitCount} songs ...`);

      const data = await getSongsByUserId(
        user.uid,
        limitCount,
        undefined,
        invertOwner,
        onlyPublished
      );

      console.log(`Found ${data.songs.length} ...`);

      if (data.songs.length > 0) {
        setAllSongs(data.songs);
      }

      setIsLoading(false);
    }
  }, []);

  const onFilterChange = useMemo(
    () => (itemFilter: string) => {
      if (allSongs) {
        if (itemFilter !== "") {
          const filteredItems = allSongs.filter(
            s =>
              s.title.toLowerCase().includes(itemFilter.toLowerCase()) ||
              s.artist.name.toLowerCase().includes(itemFilter.toLowerCase())
          );
          setSongs(filteredItems);
        } else {
          // reset query
          setSongs(allSongs);
        }
      }
    },
    [allSongs]
  );

  const columns = useMemo<ColumnDef<ISong>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: "Song Title",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              <Link to={`/songspreview/${row.original.id}`}>
                {row.original.title}
              </Link>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "artist.name",
        header: "Artist",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.artist.name}</div>
          </div>
        ),
      },
    ];
  }, []);

  const table = useReactTable({
    data: songs,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
    },
  });

  if (!allSongs) {
    return <EmptyListMessage message={"Artist or Song not found"} />;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="container mx-auto my-6">
      <SortableList table={table} onFilterChange={onFilterChange} />
    </div>
  );
}
