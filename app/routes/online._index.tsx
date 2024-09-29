// app/routes/online._index.tsx

import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Online Search" },
  { name: "description", content: "Online Search" },
];

export default function OnlineSearchView() {
  return <div className="min-h-full py-6 text-center">Online Search</div>;
}
