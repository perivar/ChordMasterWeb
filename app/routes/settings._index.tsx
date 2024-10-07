// app/routes/settings._index.tsx

import { useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { useFetcher, useRouteLoaderData } from "@remix-run/react";
import {
  updateUserAppConfigReducer,
  useAppContext,
} from "~/context/AppContext";
import { useUser } from "~/context/UserContext";
import { type loader as parentLoader } from "~/root";
import { exportFile } from "~/utils/exportFile";
import { importFile } from "~/utils/importFile";
import pad from "~/utils/pad";
import { useTranslation } from "react-i18next";
import { useTheme } from "remix-themes";

import useBundler from "~/hooks/useBundler";
import useFirestore from "~/hooks/useFirestore";
import useUserAppConfig from "~/hooks/useUserAppConfig";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import FileUploadDialog from "~/components/FileUploadDialog";
import ListItem, { ListItemOption } from "~/components/ListItem";
import { ModeToggle } from "~/components/ModeToggle";

export const meta: MetaFunction = () => [
  { title: "Settings" },
  { name: "description", content: "Settings" },
];

export default function SettingsView() {
  const { t } = useTranslation();
  const loaderData = useRouteLoaderData<typeof parentLoader>("root");
  const fetcher = useFetcher();

  const { dispatch } = useAppContext();
  const { user } = useUser();

  const [theme, _setTheme] = useTheme();

  const [isLoading, setIsLoading] = useState(false);

  const userAppConfig = useUserAppConfig();

  const [locale, setLocale] = useState(loaderData?.locale);

  const [fontSize, setFontSize] = useState<number>(userAppConfig.fontSize);
  const showTablature = userAppConfig.showTablature;
  const enablePageTurner = userAppConfig.enablePageTurner;

  const { updateUserAppConfig } = useFirestore();
  const { createBundle, decodeJsonBundle, importBundle } = useBundler();

  const showTablatureOptions: ListItemOption<boolean>[] = [
    { key: "default-show-true", label: t("show_tabs_by_default"), value: true },
    {
      key: "default-show-false",
      label: t("hide_tabs_by_default"),
      value: false,
    },
  ];

  const enablePageTurnerOptions: ListItemOption<boolean>[] = [
    {
      key: "page-turner-true",
      label: t("enable_page_turner_by_default"),
      value: true,
    },
    {
      key: "page-turner-false",
      label: t("disable_page_turner_by_default"),
      value: false,
    },
  ];

  const handleExport = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const bundle = await createBundle();

      // const bundleString = JSON.stringify(bundle);
      const bundleString = JSON.stringify(bundle, null, 2); // Create JSON string with indentation

      const today = new Date();
      const day = pad(today.getDate());
      const month = pad(today.getMonth() + 1);
      const year = today.getFullYear();
      const filename = `backup-${year}_${month}_${day}`;

      await exportFile("cache", "ChordMaster", filename, ".txt", bundleString);
    } catch (err) {
      console.warn(err);
    }
    setIsLoading(false);
  };

  const handleImport = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { success, fileContent } = await importFile();

      if (success) {
        const bundle = await decodeJsonBundle(fileContent);

        await importBundle(bundle);
        // Alert.alert(t("info"), t("songs_imported_successfully"));
      }
    } catch (err) {
      console.warn(err);
    }
    setIsLoading(false);
  };

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    fetcher.submit(
      { locale: newLocale },
      { method: "post", action: "/action/set-locale" }
    );

    onChangeLanguage(newLocale);
  };

  const onChangeLanguage = async (value: string) => {
    if (user && user.uid) {
      await updateUserAppConfig(user.uid, { language: value });
      dispatch(updateUserAppConfigReducer({ language: value }));
      setLocale(value);
    }
  };

  const onChangeShowTablature = async (value: boolean) => {
    if (user && user.uid) {
      await updateUserAppConfig(user.uid, { showTablature: value });
      dispatch(updateUserAppConfigReducer({ showTablature: value }));
    }
  };

  const onChangeEnablePageTurner = async (value: boolean) => {
    if (user && user.uid) {
      await updateUserAppConfig(user.uid, { enablePageTurner: value });
      dispatch(updateUserAppConfigReducer({ enablePageTurner: value }));
    }
  };

  return (
    <div className="container mx-auto my-6">
      <h1 className="pb-2 text-2xl font-bold">{t("settings")}</h1>

      <ListItem
        onClick={handleExport}
        title={t("create_backup")}
        subtitle={t("create_backup_description")}
      />

      <ListItem title={t("import")} subtitle={t("import_description")}>
        <FileUploadDialog
          dialogTitle={t("upload_restore")}
          dialogDescription={t("upload_restore_json_file")}
          openButtonLabel={t("upload_restore")}
          closeButtonLabel={t("cancel")}
          handleFileContent={val => console.log(val)}
        />
      </ListItem>

      <ListItem title={t("theme")} subtitle={`${theme}`}>
        <ModeToggle />
      </ListItem>

      <ListItem
        title={t("language")}
        subtitle={locale === "en" ? "English" : "Norwegian"}>
        <fetcher.Form
          method="post"
          action="/action/set-locale"
          className="flex flex-row gap-5">
          <Select onValueChange={handleLocaleChange} value={locale}>
            <SelectTrigger className="w-fit">
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
      </ListItem>

      <ListItem title={t("text_size")} subtitle={`${fontSize}`}>
        <Slider
          min={12}
          max={24}
          value={[fontSize]}
          onValueChange={value => setFontSize(value[0])}
          step={1}
          className="w-2/5"></Slider>
      </ListItem>

      <ListItem title={t("guitar_tabs")}>
        <Select
          onValueChange={value => onChangeShowTablature(value == "true")}
          defaultValue={`${showTablature}`}>
          <SelectTrigger className="w-fit">
            <SelectValue placeholder={t("guitar_tabs")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {showTablatureOptions.map(o => {
                return (
                  <SelectItem key={`${o.key}`} value={`${o.value}`}>
                    {`${o.label}`}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </ListItem>

      <ListItem title={t("page_turner")}>
        <Select
          onValueChange={value => onChangeEnablePageTurner(value == "true")}
          defaultValue={`${enablePageTurner}`}>
          <SelectTrigger className="w-fit">
            <SelectValue placeholder={t("page_turner")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {enablePageTurnerOptions.map(o => {
                return (
                  <SelectItem key={`${o.key}`} value={`${o.value}`}>
                    {`${o.label}`}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </ListItem>
    </div>
  );
}
