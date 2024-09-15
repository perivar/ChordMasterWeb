import { IAppConfig, IUserAppConfig } from "../hooks/useFirestore";

export const USER_APP_DEFAULTS: IUserAppConfig = {
  language: "en_us",
  fontSize: 14,
  showTablature: true,
  enablePageTurner: false,
};

export const APP_DEFAULTS: IAppConfig = {};
