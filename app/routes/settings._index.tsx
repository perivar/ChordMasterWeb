// app/routes/settings._index.tsx

import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Settings" },
  { name: "description", content: "Settings" },
];

export default function SettingsView() {
  return <div className="min-h-full py-6 text-center">Settings</div>;
}
