// app/routes/artists.$id.tsx

import { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";

export const meta: MetaFunction = () => [
  
  { title: "Artist" },
  { name: "description", content: "View Artist" },
];

export default function ArtistView() {
  const params = useParams();

  return <div className="min-h-full">{params.id}</div>;
}
