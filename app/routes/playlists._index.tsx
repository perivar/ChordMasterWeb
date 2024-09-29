// app/routes/playlists._index.tsx

import { useMemo, useState } from "react";
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
import { MoreHorizontal } from "lucide-react";

import { IPlaylist } from "~/hooks/useFirestore";
import usePlaylists from "~/hooks/usePlaylists";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import SortableList from "~/components/SortableList";

export const meta: MetaFunction = () => [
  { title: "Playlists" },
  { name: "description", content: "View Playlists" },
];

export default function PlaylistsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const allItems = usePlaylists();
  const [playlists, setPlaylists] = useState<IPlaylist[]>(allItems);

  const onFilterChange = useMemo(
    () => (itemFilter: string) => {
      if (itemFilter !== "") {
        const filteredItems = allItems.filter(s =>
          s.name.toLowerCase().includes(itemFilter)
        );
        setPlaylists(filteredItems);
      } else {
        // reset query
        setPlaylists(allItems);
      }
    },
    [allItems]
  );

  const columns = useMemo<ColumnDef<IPlaylist>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Playlist",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              <Link to={`/playlists/${row.original.id}`}>
                {row.original.name}
              </Link>
            </div>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="size-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link to={`/playlists/${row.original.id}`}>
                      Go To Playlist
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: playlists,
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

  return (
    <div className="my-6">
      <SortableList table={table} onFilterChange={onFilterChange} />
    </div>
  );
}
