// app/routes/settings._index.tsx

import { useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { useFetcher, useRouteLoaderData } from "@remix-run/react";
import { type loader as parentLoader } from "~/root";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const meta: MetaFunction = () => [
  { title: "Settings" },
  { name: "description", content: "Settings" },
];

export default function SettingsView() {
  const { t } = useTranslation();
  const loaderData = useRouteLoaderData<typeof parentLoader>("root");

  const fetcher = useFetcher();
  const [locale, setLocale] = useState(loaderData?.locale);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    fetcher.submit(
      { locale: newLocale },
      { method: "post", action: "/action/set-locale" }
    );
  };

  return (
    <div className="container mx-auto my-6">
      <h1>{t("description")}</h1>

      <fetcher.Form
        method="post"
        action="/action/set-locale"
        className="mt-4 flex flex-row gap-5">
        <Select onValueChange={handleLocaleChange} value={locale}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              {locale === "en" ? "English" : "Norwegian"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">Norwegian</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </fetcher.Form>
    </div>
  );
}
