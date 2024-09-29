// app/routes/artists._index.tsx

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

import useArtists from "~/hooks/useArtists";
import { IArtist } from "~/hooks/useFirestore";
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
  { title: "Artists" },
  { name: "description", content: "View Artists" },
];

export default function ArtistsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const allItems = useArtists();
  const [artists, setArtists] = useState<IArtist[]>(allItems);

  const onFilterChange = useMemo(
    () => (itemFilter: string) => {
      if (itemFilter !== "") {
        const filteredItems = allItems.filter(s =>
          s.name.toLowerCase().includes(itemFilter)
        );
        setArtists(filteredItems);
      } else {
        // reset query
        setArtists(allItems);
      }
    },
    [allItems]
  );

  const columns = useMemo<ColumnDef<IArtist>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Artist",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              <Link to={`/artists/${row.original.id}`}>
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
                    <Link to={`/artists/${row.original.id}`}>Go To Artist</Link>
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
    data: artists,
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
