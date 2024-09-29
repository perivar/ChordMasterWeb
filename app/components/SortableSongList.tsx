// https://v0.dev/chat/RVaUfCf5axe

import { useMemo, useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { useConfirm } from "./layout/confirm-provider";
import SortableList from "./SortableList";

interface ListItem {
  id?: string;
  title: string;
  artist: { id?: string; name: string };
}

interface ListProps<T extends ListItem> {
  allItems: T[];
}

export default function SortableSongList<T extends ListItem>({
  allItems,
}: ListProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [songs, setSongs] = useState<T[]>(allItems);
  const confirm = useConfirm();
  const navigate = useNavigate();

  const onFilterChange = useMemo(
    () => (itemFilter: string) => {
      if (itemFilter !== "") {
        const filteredItems = allItems.filter(
          s =>
            s.title.toLowerCase().includes(itemFilter.toLowerCase()) ||
            s.artist.name.toLowerCase().includes(itemFilter.toLowerCase())
        );
        setSongs(filteredItems);
      } else {
        // reset query
        setSongs(allItems);
      }
    },
    [allItems]
  );

  const columns = useMemo<ColumnDef<T>[]>(() => {
    const handleEdit = async (id: string | undefined) => {
      return navigate(`/songs/${id}/edit`);
    };

    const handleDelete = async (
      id: string | undefined,
      songTitle: string | undefined
    ) => {
      try {
        await confirm({
          title: `Delete Song (${songTitle})`,
          description: "Are you sure you want to permanently delete it?",
        });

        // Here you can add the logic to delete the item after confirmation
        // Example: await deleteItem(id);

        console.log(`Deleted item with id: ${id}`);
      } catch (_err) {
        // If the user cancels the confirmation, handle the rejection here
        console.log(`Delete operation was cancelled (id: ${id})`);
      }
    };

    return [
      {
        accessorKey: "title",
        header: "Song Title",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              <Link to={`/songs/${row.original.id}`}>{row.original.title}</Link>
            </div>
            <div className="text-sm text-muted-foreground md:hidden">
              <Link to={`/artists/${row.original.artist.id}`}>
                {row.original.artist.name}
              </Link>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "artist.name",
        header: "Artist",
        cell: ({ row }) => (
          <div className="hidden md:table-cell">
            <Link to={`/artists/${row.original.artist.id}`}>
              {row.original.artist.name}
            </Link>
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
                    <Link to={`/artists/${row.original.artist.id}`}>
                      Go To Artist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
                    <Edit className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handleDelete(row.original.id, row.original.title)
                    }>
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];
  }, [confirm, navigate]);

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

  return <SortableList table={table} onFilterChange={onFilterChange} />;
}
