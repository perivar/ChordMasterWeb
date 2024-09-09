// https://v0.dev/chat/RVaUfCf5axe

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link } from "@remix-run/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { DataTablePagination } from "~/components/data-table-navigation";

import { useConfirm } from "./layout/confirm-provider";

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
  const [itemFilter, setItemFilter] = useState("");
  const [songs, setSongs] = useState<T[]>(allItems);
  const confirm = useConfirm();

  useEffect(() => {
    if (itemFilter !== "") {
      const filteredItems = allItems.filter(
        s =>
          s.title.toLowerCase().includes(itemFilter) ||
          s.artist.name.toLowerCase().includes(itemFilter)
      );
      setSongs(filteredItems);
    } else {
      // reset query
      setSongs(allItems);
    }
  }, [allItems, itemFilter]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const filterQuery = e.target.value;
    setItemFilter(filterQuery);
  };

  const handleEdit = async (id: string | undefined) => {
    console.log(`Edit item with id: ${id}`);

    // Implement edit functionality here
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

  const columns = useMemo<ColumnDef<T>[]>(
    () => [
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
    ],
    []
  );

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

  return (
    <>
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="relative w-full max-w-md py-2">
            <Input
              placeholder="Search"
              value={itemFilter}
              onChange={handleFilterChange}
              className="w-full pr-10"
            />
            {itemFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
                onClick={_ => setItemFilter("")}>
                <X className="size-4 text-muted-foreground" />
                <span className="sr-only">Clear filter</span>
              </Button>
            )}
          </div>
        </div>
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-2 ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={header.column.getToggleSortingHandler()}
                        onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="ml-2 size-4" />,
                          desc: <ChevronDown className="ml-2 size-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DataTablePagination table={table} />
      </div>
    </>
  );
}
