import React, { createContext, ReactNode, useReducer } from "react";
import { createSlice, PayloadAction, UnknownAction } from "@reduxjs/toolkit";
import { APP_DEFAULTS, USER_APP_DEFAULTS } from "~/constants/defaults";

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
  songs: ISong[];
  artists: IArtist[];
  playlists: IPlaylist[];
  appConfig: IAppConfig;
  userAppConfig: IUserAppConfig;
};

const initialState: State = {
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
    // Song Reducers
    setSongs(state, action: PayloadAction<ISong[]>) {
      state.songs = action.payload;
    },
    setOrUpdateSongs(state, action: PayloadAction<ISong[]>) {
      action.payload.forEach(element => {
        // add or update
        const songIndex = state.songs.findIndex(song => song.id === element.id);
        if (songIndex !== -1) {
          // update
          state.songs[songIndex] = {
            ...state.songs[songIndex],
            ...element,
          };
        } else {
          // add
          state.songs.push(element);
        }
      });
    },
    newSong(state, action: PayloadAction<ISong>) {
      state.songs.push(action.payload);
    },
    addOrUpdateSong(state, action: PayloadAction<ISong>) {
      // add or update
      const songIndex = state.songs.findIndex(
        song => song.id === action.payload.id
      );
      if (songIndex !== -1) {
        // update
        state.songs[songIndex] = {
          ...state.songs[songIndex],
          ...action.payload,
        };
      } else {
        // add
        state.songs.push(action.payload);
      }
    },
    editSong(state, action: PayloadAction<ISong>) {
      // edit the songs
      const songIndex = state.songs.findIndex(
        song => song.id === action.payload.id
      );
      if (songIndex !== -1) {
        state.songs[songIndex] = {
          ...state.songs[songIndex],
          ...action.payload,
        };
      }
    },
    deleteSong(state, action: PayloadAction<string>) {
      state.songs = state.songs.filter(arrow => arrow.id !== action.payload);
    },

    // Artist Reducers
    setArtists(state, action: PayloadAction<IArtist[]>) {
      state.artists = action.payload;
    },
    setOrUpdateArtists(state, action: PayloadAction<IArtist[]>) {
      action.payload.forEach(element => {
        // add or update
        const artistIndex = state.artists.findIndex(
          artist => artist.id === element.id
        );
        if (artistIndex !== -1) {
          // update
          state.artists[artistIndex] = {
            ...state.artists[artistIndex],
            ...element,
          };
        } else {
          // add
          state.artists.push(element);
        }
      });
    },
    newArtist(state, action: PayloadAction<IArtist>) {
      state.artists.push(action.payload);
    },
    addOrUpdateArtist(state, action: PayloadAction<IArtist>) {
      // add or update
      const artistIndex = state.artists.findIndex(
        artist => artist.id === action.payload.id
      );
      if (artistIndex !== -1) {
        // update
        state.artists[artistIndex] = {
          ...state.artists[artistIndex],
          ...action.payload,
        };
      } else {
        // add
        state.artists.push(action.payload);
      }
    },
    editArtist(state, action: PayloadAction<IArtist>) {
      // edit the artists
      const artistIndex = state.artists.findIndex(
        artist => artist.id === action.payload.id
      );
      if (artistIndex !== -1) {
        state.artists[artistIndex] = {
          ...state.artists[artistIndex],
          ...action.payload,
        };
      }
    },
    deleteArtist(state, action: PayloadAction<string>) {
      state.artists = state.artists.filter(
        arrow => arrow.id !== action.payload
      );
    },

    // Playlist Reducers
    setPlaylists(state, action: PayloadAction<IPlaylist[]>) {
      state.playlists = action.payload;
    },
    setOrUpdatePlaylists(state, action: PayloadAction<IPlaylist[]>) {
      action.payload.forEach(element => {
        // add or update
        const playlistIndex = state.playlists.findIndex(
          playlist => playlist.id === element.id
        );
        if (playlistIndex !== -1) {
          // update
          state.playlists[playlistIndex] = {
            ...state.playlists[playlistIndex],
            ...element,
          };
        } else {
          // add
          state.playlists.push(element);
        }
      });
    },
    newPlaylist(state, action: PayloadAction<IPlaylist>) {
      state.playlists.push(action.payload);
    },
    addOrUpdatePlaylist(state, action: PayloadAction<IPlaylist>) {
      // add or update
      const playlistIndex = state.playlists.findIndex(
        playlist => playlist.id === action.payload.id
      );
      if (playlistIndex !== -1) {
        // update
        state.playlists[playlistIndex] = {
          ...state.playlists[playlistIndex],
          ...action.payload,
        };
      } else {
        // add
        state.playlists.push(action.payload);
      }
    },
    editPlaylist(state, action: PayloadAction<IPlaylist>) {
      // edit the playlists
      const playlistIndex = state.playlists.findIndex(
        playlist => playlist.id === action.payload.id
      );
      if (playlistIndex !== -1) {
        state.playlists[playlistIndex] = {
          ...state.playlists[playlistIndex],
          ...action.payload,
        };
      }
    },
    deletePlaylist(state, action: PayloadAction<string>) {
      state.playlists = state.playlists.filter(
        arrow => arrow.id !== action.payload
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
  setSongs,
  setOrUpdateSongs,
  newSong,
  editSong,
  deleteSong,
  addOrUpdateSong,

  setArtists,
  setOrUpdateArtists,
  newArtist,
  editArtist,
  deleteArtist,
  addOrUpdateArtist,

  setPlaylists,
  setOrUpdatePlaylists,
  newPlaylist,
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

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appSlice.reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
