// app/routes/settings._index.tsx

import { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => [
  { title: "Settings" },
  { name: "description", content: "Settings" },
];

export default function SettingsView() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto my-6">
      <h1>{t("description")}</h1>

      <Form className="flex flex-row gap-5">
        <Button type="submit" name="lng" value="no">
          Norsk
        </Button>

        <Button type="submit" name="lng" value="en">
          English
        </Button>
      </Form>
    </div>
  );
}
