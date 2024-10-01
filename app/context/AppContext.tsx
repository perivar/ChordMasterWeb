import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
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
import { getCache, setCache } from "~/utils/localStorageUtils";

import {
  IAppConfig,
  IArtist,
  IAuthUser,
  IPlaylist,
  ISong,
  IUserAppConfig,
} from "~/hooks/useFirestore";

import { useUser } from "./UserContext";

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

const CACHE_TTL = 4 * 60 * 60 * 1000; // Cache TTL in milliseconds (4 hour)
const LOCAL_STORAGE_KEY = "appState";

// Function to compare current state with initialState, while ignoring user
const isStateDifferentFromInitialState = (persistedState: State | null) => {
  if (!persistedState) return false;

  // Compare the rest of the state ignoring the user property
  return JSON.stringify(persistedState) !== JSON.stringify(initialState);
};

export const saveStateToLocalStorage = (state: State, user?: IAuthUser) => {
  try {
    if (user?.uid) {
      const userKey = user.uid;
      const localStorageKey = `${LOCAL_STORAGE_KEY}_${userKey}`;

      // Check if the state is different from the initial state
      if (!isStateDifferentFromInitialState(state)) {
        return; // Exit if the state hasn't changed
      }

      setCache(localStorageKey, state, CACHE_TTL);
    }
  } catch (error) {
    console.error("Could not save state", error);
  }
};

// Load state from local storage using the user-specific key
export const loadStateFromLocalStorage = (
  user?: IAuthUser
): State | undefined => {
  try {
    if (user) {
      const userKey = user?.uid;
      const localStorageKey = `${LOCAL_STORAGE_KEY}_${userKey}`;

      // getCache return null if non exist or expired
      return getCache(localStorageKey) ?? undefined;
    }
    return undefined;
  } catch (error) {
    console.error("Could not load state", error);
    return undefined;
  }
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
    addOrUpdateSongs(state, action: PayloadAction<ISong[]>) {
      state.songs = addOrUpdateSongsInArray(state.songs, action.payload);
    },
    addSongReducer(state, action: PayloadAction<ISong>) {
      state.songs = addSongToArray(state.songs, action.payload);
    },
    addOrUpdateSongReducer(state, action: PayloadAction<ISong>) {
      state.songs = addOrUpdateSongInArray(state.songs, action.payload);
    },
    editSongReducer(state, action: PayloadAction<ISong>) {
      state.songs = editSongInArray(state.songs, action.payload);
    },
    deleteSongReducer(state, action: PayloadAction<string>) {
      state.songs = deleteSongFromArray(state.songs, action.payload);
    },

    // Artist Reducers
    setArtists(state, action: PayloadAction<IArtist[]>) {
      state.artists = action.payload;
    },
    addOrUpdateArtists(state, action: PayloadAction<IArtist[]>) {
      state.artists = addOrUpdateArtistsInArray(state.artists, action.payload);
    },
    addArtistReducer(state, action: PayloadAction<IArtist>) {
      state.artists = addArtistToArray(state.artists, action.payload);
    },
    addOrUpdateArtistReducer(state, action: PayloadAction<IArtist>) {
      state.artists = addOrUpdateArtistInArray(state.artists, action.payload);
    },
    editArtistReducer(state, action: PayloadAction<IArtist>) {
      state.artists = editArtistInArray(state.artists, action.payload);
    },
    deleteArtistReducer(state, action: PayloadAction<string>) {
      state.artists = deleteArtistFromArray(state.artists, action.payload);
    },

    // Playlist Reducers
    setPlaylists(state, action: PayloadAction<IPlaylist[]>) {
      state.playlists = action.payload;
    },
    addOrUpdatePlaylists(state, action: PayloadAction<IPlaylist[]>) {
      state.playlists = addOrUpdatePlaylistsInArray(
        state.playlists,
        action.payload
      );
    },
    addPlaylistReducer(state, action: PayloadAction<IPlaylist>) {
      state.playlists = addPlaylistToArray(state.playlists, action.payload);
    },
    addOrUpdatePlaylistReducer(state, action: PayloadAction<IPlaylist>) {
      state.playlists = addOrUpdatePlaylistInArray(
        state.playlists,
        action.payload
      );
    },
    editPlaylistReducer(state, action: PayloadAction<IPlaylist>) {
      state.playlists = editPlaylistInArray(state.playlists, action.payload);
    },
    deletePlaylistReducer(state, action: PayloadAction<string>) {
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

    // Reset State Reducer
    resetState: () => initialState,

    // Reducer to set the entire persisted state
    setState(_state, action: PayloadAction<State>) {
      return action.payload; // Replace current state with new state
    },

    // Reducer to merge state
    mergeState(state, action: PayloadAction<State>) {
      return { ...state, ...action.payload }; // Merge persisted state with current state
    },
  },
});

// Export actions for use in components
export const {
  setSongs,
  addOrUpdateSongs,
  addSongReducer,
  editSongReducer,
  deleteSongReducer,
  addOrUpdateSongReducer,

  setArtists,
  addOrUpdateArtists,
  addArtistReducer,
  editArtistReducer,
  deleteArtistReducer,
  addOrUpdateArtistReducer,

  setPlaylists,
  addOrUpdatePlaylists,
  addPlaylistReducer,
  editPlaylistReducer,
  deletePlaylistReducer,
  addOrUpdatePlaylistReducer,

  // config
  setAppConfig,
  updateAppConfig,
  setUserAppConfig,
  updateUserAppConfig,

  // reset
  resetState,
  setState,
  mergeState,
} = appSlice.actions;

const AppContext = createContext<
  { state: State; dispatch: React.Dispatch<UnknownAction> } | undefined
>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();

  // Initial state using just initialState
  const [state, dispatch] = useReducer(appSlice.reducer, initialState);

  // Save state to local storage on every state change if the user exists
  useEffect(() => {
    if (user) {
      saveStateToLocalStorage(state, user);
    }
  }, [state, user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the UserContext
// example: const { state, dispatch } = useAppContext();
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
