// app/routes/_index.tsx

import { useEffect, useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, redirect, useLoaderData } from "@remix-run/react";
import { isSessionValid } from "~/fb.sessions.server";
import { db } from "~/firebase-service";
import {
  collection,
  DocumentData,
  getDocs,
  query,
  where,
} from "firebase/firestore";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export const meta: MetaFunction = () => {
  return [
    { title: "ChordMaster" },
    { name: "description", content: "Sheet music, chords and tabs" },
  ];
};

// use loader to check for existing session, if not found, send the user to login
export async function loader({ request }: LoaderFunctionArgs) {
  const userSession = await isSessionValid(request);

  if (userSession?.success) {
    const decodedClaims = userSession?.decodedClaims;
    return { decodedClaims };
  } else {
    throw redirect("/login", {
      statusText: (userSession?.error as Error)?.message,
    });
  }
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const [songList, setSongList] = useState<
    {
      id: string;
      song: DocumentData;
    }[]
  >();

  useEffect(() => {
    const getData = async () => {
      const userId = loaderData.decodedClaims?.uid;

      const songsQuery = query(
        collection(db, "songs"),
        where("user.uid", "==", userId)
      );

      const songsSnapshots = await getDocs(songsQuery);

      if (songsSnapshots && songsSnapshots.size > 0) {
        console.log(`Found ${songsSnapshots.size} Songs ...`);

        const songs: { id: string; song: DocumentData }[] = [];
        songsSnapshots.forEach(songSnapshot => {
          const data = songSnapshot.data();
          songs.push({ id: songSnapshot.id, song: data });
        });
        setSongList(songs);
      }
    };
    getData();
  }, [loaderData.decodedClaims]);

  const handleEdit = async (id: number) => {
    console.log(`Edit song with id: ${id}`);
    alert(`Edit song with id: ${id}`);

    // Implement edit functionality here
  };

  const handleDelete = async (id: number) => {
    console.log(`Delete song with id: ${id}`);
    alert(`Delete song with id: ${id}`);

    // Implement delete functionality here
  };

  return (
    <>
      {loaderData.decodedClaims?.email && (
        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="grid grid-cols-2 gap-2">
            <div>You are logged in as:</div>
            <div className="text-blue-600">
              {loaderData.decodedClaims?.email}
            </div>
          </div>
          <div className="text-center">
            Do you want to{" "}
            <Link to="/logout" className="font-medium underline">
              Log Out?
            </Link>
          </div>
        </div>
      )}

      <div className="container mx-auto py-10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="md:w-2/5">Song</TableHead>
              <TableHead className="hidden md:table-cell">Artist</TableHead>
              <TableHead className="hidden md:table-cell">Edit</TableHead>
              <TableHead className="hidden md:table-cell">Delete</TableHead>
              <TableHead className="md:hidden">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songList?.map((data, i) => {
              const song = data.song;
              return (
                <TableRow key={i}>
                  <TableCell className="md:hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {song.artist.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Go To Artist</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(song.id)}>
                          <Edit className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(song.id)}>
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="hidden font-medium md:table-cell">
                    {song.title}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {song.artist.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(song.id)}>
                      <Edit className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(song.id)}>
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
