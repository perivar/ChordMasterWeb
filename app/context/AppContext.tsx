import React, { createContext, ReactNode, useReducer } from "react";
import { createSlice, PayloadAction, UnknownAction } from "@reduxjs/toolkit";
import { APP_DEFAULTS, USER_APP_DEFAULTS } from "~/constants/defaults";
import {
  addArtistToArray,
  addOrUpdateArtistInArray,
  addOrUpdateArtistsInArray,
  addOrUpdatePlaylistInArray,
  addOrUpdatePlaylistsInArray,
  addOrUpdateSongInArray,
  addOrUpdateSongsInArray,
  addPlaylistToArray,
  addSongToArray,
  deleteArtistFromArray,
  deletePlaylistFromArray,
  deleteSongFromArray,
  editArtistInArray,
  editPlaylistInArray,
  editSongInArray,
} from "~/utils/arrayUtilities";

import {
  IAppConfig,
  IArtist,
  IPlaylist,
  ISong,
  IUserAppConfig,
} from "~/hooks/useFirestore";

export type IUserRecord = {
  uid?: string;
  email?: string;
  displayName?: string;
  avatar?: string;
};

type State = {
  user?: IUserRecord;
  songs: ISong[];
  artists: IArtist[];
  playlists: IPlaylist[];
  appConfig: IAppConfig;
  userAppConfig: IUserAppConfig;
};

const initialState: State = {
  user: undefined,
  songs: [],
  playlists: [],
  artists: [],
  appConfig: APP_DEFAULTS,
  userAppConfig: USER_APP_DEFAULTS,
};

// Create slice using @reduxjs/toolkit
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // User Reducers
    setUser(state, action: PayloadAction<IUserRecord>) {
      state.user = action.payload;
    },

    // Song Reducers
    setSongs(state, action: PayloadAction<ISong[]>) {
      state.songs = action.payload;
    },
    addSong(state, action: PayloadAction<ISong>) {
      state.songs = addSongToArray(state.songs, action.payload);
    },
    addOrUpdateSongs(state, action: PayloadAction<ISong[]>) {
      state.songs = addOrUpdateSongsInArray(state.songs, action.payload);
    },
    addOrUpdateSong(state, action: PayloadAction<ISong>) {
      state.songs = addOrUpdateSongInArray(state.songs, action.payload);
    },
    editSong(state, action: PayloadAction<ISong>) {
      state.songs = editSongInArray(state.songs, action.payload);
    },
    deleteSong(state, action: PayloadAction<string>) {
      state.songs = deleteSongFromArray(state.songs, action.payload);
    },

    // Artist Reducers
    setArtists(state, action: PayloadAction<IArtist[]>) {
      state.artists = action.payload;
    },
    addArtist(state, action: PayloadAction<IArtist>) {
      state.artists = addArtistToArray(state.artists, action.payload);
    },
    addOrUpdateArtists(state, action: PayloadAction<IArtist[]>) {
      state.artists = addOrUpdateArtistsInArray(state.artists, action.payload);
    },
    addOrUpdateArtist(state, action: PayloadAction<IArtist>) {
      state.artists = addOrUpdateArtistInArray(state.artists, action.payload);
    },
    editArtist(state, action: PayloadAction<IArtist>) {
      state.artists = editArtistInArray(state.artists, action.payload);
    },
    deleteArtist(state, action: PayloadAction<string>) {
      state.artists = deleteArtistFromArray(state.artists, action.payload);
    },

    // Playlist Reducers
    setPlaylists(state, action: PayloadAction<IPlaylist[]>) {
      state.playlists = action.payload;
    },
    addPlaylist(state, action: PayloadAction<IPlaylist>) {
      state.playlists = addPlaylistToArray(state.playlists, action.payload);
    },
    addOrUpdatePlaylists(state, action: PayloadAction<IPlaylist[]>) {
      state.playlists = addOrUpdatePlaylistsInArray(
        state.playlists,
        action.payload
      );
    },
    addOrUpdatePlaylist(state, action: PayloadAction<IPlaylist>) {
      state.playlists = addOrUpdatePlaylistInArray(
        state.playlists,
        action.payload
      );
    },
    editPlaylist(state, action: PayloadAction<IPlaylist>) {
      state.playlists = editPlaylistInArray(state.playlists, action.payload);
    },
    deletePlaylist(state, action: PayloadAction<string>) {
      state.playlists = deletePlaylistFromArray(
        state.playlists,
        action.payload
      );
    },

    // Confiig Reducers
    setAppConfig: (state, action: PayloadAction<IAppConfig>) => {
      state.appConfig = action.payload;
    },
    updateAppConfig: (state, action: PayloadAction<Partial<IAppConfig>>) => {
      // update only part of the state
      // like dispatch(updateAppConfig({language: 'en'})
      state.appConfig = { ...state.appConfig, ...action.payload };
    },
    setUserAppConfig: (state, action: PayloadAction<IUserAppConfig>) => {
      state.userAppConfig = action.payload;
    },
    updateUserAppConfig: (
      state,
      action: PayloadAction<Partial<IUserAppConfig>>
    ) => {
      // update only part of the state
      // like dispatch(updateUserAppConfig({language: 'en'})
      state.userAppConfig = { ...state.userAppConfig, ...action.payload };
    },
  },
});

// Export actions for use in components
export const {
  setUser,

  setSongs,
  addSong,
  addOrUpdateSongs,
  editSong,
  deleteSong,
  addOrUpdateSong,

  setArtists,
  addArtist,
  addOrUpdateArtists,
  editArtist,
  deleteArtist,
  addOrUpdateArtist,

  setPlaylists,
  addPlaylist,
  addOrUpdatePlaylists,
  editPlaylist,
  deletePlaylist,
  addOrUpdatePlaylist,

  // config
  setAppConfig,
  updateAppConfig,
  setUserAppConfig,
  updateUserAppConfig,
} = appSlice.actions;

const AppContext = createContext<
  { state: State; dispatch: React.Dispatch<UnknownAction> } | undefined
>(undefined);

const AppProvider = ({
  children,
  user,
}: {
  children: ReactNode;
  user?: IUserRecord;
}) => {
  const [state, dispatch] = useReducer(appSlice.reducer, {
    ...initialState,
    user, // Initialize the state with the user object
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
