// app/routes/playlists._index.tsx

import { useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { Link, useNavigate } from "@remix-run/react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  addOrUpdatePlaylistReducer,
  deletePlaylistReducer,
  useAppContext,
} from "~/context/AppContext";
import { useUser } from "~/context/UserContext";
import { Edit, MoreHorizontal, PlusIcon, Trash2 } from "lucide-react";

import useFirestore, { IPlaylist } from "~/hooks/useFirestore";
import usePlaylists from "~/hooks/usePlaylists";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useConfirm } from "~/components/layout/confirm-provider";
import SortableList from "~/components/SortableList";
import { TextInputModal } from "~/components/TextInputModal";

export const meta: MetaFunction = () => [
  { title: "Playlists" },
  { name: "description", content: "View Playlists" },
];

export default function PlaylistsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { dispatch } = useAppContext();
  const { user } = useUser();

  const allItems = usePlaylists();
  const [playlists, setPlaylists] = useState<IPlaylist[]>(allItems);

  const [showAddPlaylistModal, setShowAddPlaylistModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deletePlaylist, addNewPlaylist } = useFirestore();

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

  const onSubmit = async (playlistName: string) => {
    try {
      if (playlistName === "") {
        throw new Error("Empty name not allowed");
      }

      if (user && user.uid) {
        const playlist = await addNewPlaylist(
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
          playlistName,
          []
        );

        console.log("onSubmit -> addNewPlaylist:", playlist.id);

        await dispatch(addOrUpdatePlaylistReducer(playlist));

        setShowAddPlaylistModal(false);
        // setPlaylists(Playlist.getAll());
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        throw e;
      }
    }
  };

  const columns = useMemo<ColumnDef<IPlaylist>[]>(() => {
    const handleEdit = async (id: string | undefined) => {
      return navigate(`/playlists/${id}/edit`);
    };

    const handleDelete = async (
      id: string | undefined,
      playlistName: string | undefined
    ) => {
      try {
        await confirm({
          title: `Delete Playlist (${playlistName})`,
          description: "Are you sure you want to permanently delete it?",
        });

        if (id) {
          await deletePlaylist(id);
          dispatch(deletePlaylistReducer(id));

          console.log(`Deleted item with id: ${id}`);

          navigate(`/playlists`); // TODO: this does not work!
        }
      } catch (_err) {
        // If the user cancels the confirmation, handle the rejection here
        console.log(`Delete operation was cancelled (id: ${id})`);
      }
    };

    return [
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
                    <Edit className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handleDelete(row.original.id, row.original.name)
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
  }, [confirm, deletePlaylist, dispatch, navigate]);

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
    <div className="container mx-auto my-6">
      <div className="mb-2 flex w-full flex-row items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex-1 text-center text-xl">Playlists</div>
        <div className="ml-2 flex flex-1 flex-row items-center justify-end gap-2">
          <Button size="sm" onClick={() => setShowAddPlaylistModal(true)}>
            <PlusIcon className="size-4 " />
            <span className="ml-2 hidden sm:block">Add Playlist</span>
          </Button>
        </div>
      </div>

      <TextInputModal
        error={error}
        enabled={showAddPlaylistModal}
        dialogTitle={"Add Playlist"}
        onDismiss={() => {
          setError(null);
          setShowAddPlaylistModal(false);
        }}
        dismissButtonTitle={"Cancel"}
        onSubmit={onSubmit}
        submitButtonTitle={"Create"}
        placeholder={"Playlist Name"}
      />

      <SortableList table={table} onFilterChange={onFilterChange} />
    </div>
  );
}
