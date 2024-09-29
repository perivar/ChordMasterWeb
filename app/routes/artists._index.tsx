// app/routes/artists._index.tsx

import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Artists" },
  { name: "description", content: "View Artists" },
];

export default function ArtistView() {
  return <div className="min-h-full">Showing all artists</div>;
}
