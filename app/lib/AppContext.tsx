import React, { createContext, ReactNode, useReducer } from "react";

import {
  IAppConfig,
  IArtist,
  IPlaylist,
  ISong,
  IUserAppConfig,
} from "~/hooks/useFirestore";

type State = {
  songs: ISong[];
  artists: IArtist[];
  playlists: IPlaylist[];
  appConfig: IAppConfig;
  userAppConfig: IUserAppConfig;
};

type Action =
  | { type: "SET_SONGS"; songs: ISong[] }
  | { type: "SET_PLAYLISTS"; playlists: IPlaylist[] }
  | { type: "SET_ARTISTS"; artists: IArtist[] }
  | { type: "SET_APP_CONFIG"; appConfig: IAppConfig }
  | { type: "SET_USER_APP_CONFIG"; userAppConfig: IUserAppConfig };

const initialState: State = {
  songs: [],
  playlists: [],
  artists: [],
  appConfig: {},
  userAppConfig: {
    language: "en_us",
    fontSize: 14,
    showTablature: true,
    enablePageTurner: false,
  },
};

function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SONGS":
      return { ...state, songs: action.songs };
    case "SET_PLAYLISTS":
      return { ...state, playlists: action.playlists };
    case "SET_ARTISTS":
      return { ...state, artists: action.artists };
    case "SET_APP_CONFIG":
      return { ...state, appConfig: action.appConfig };
    case "SET_USER_APP_CONFIG":
      return { ...state, userAppConfig: action.userAppConfig };
    default:
      return state;
  }
}

const AppContext = createContext<
  { state: State; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
