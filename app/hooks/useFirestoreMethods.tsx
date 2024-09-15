import { useState } from "react";
import {
  addOrUpdatePlaylists,
  addOrUpdateSongs,
  setArtists,
  setPlaylists,
  setSongs,
  updateAppConfig,
  updateUserAppConfig,
} from "~/context/AppContext";
import {
  addOrUpdateArtistInArray,
  addOrUpdatePlaylistInArray,
  addOrUpdateSongInArray,
  addPlaylistToArray,
} from "~/utils/arrayUtilities";
import { clearCache, getCache, setCache } from "~/utils/localStorageUtils";

import useAppContext from "./useAppContext";
import useFirestore, { IPlaylist, ISong } from "./useFirestore";
import useIsMounted from "./useIsMounted";

export type UseFirestoreMethodsHookResult = {
  isLoading: boolean;
  loadAppConfigData: (id: string) => Promise<void>;
  loadUserAppConfigData: () => Promise<void>;
  loadArtistData: () => Promise<void>;
  loadUserSongData: () => Promise<void>;
  loadUserPlaylistData: () => Promise<void>;
  loadSongData: (songId: string) => Promise<void>;
  loadPlaylistData: (playlistId: string) => Promise<void>;
  hasPlaylistContainsSong: (playlistId: string, songId: string) => boolean;
  playlistAddSong: (playlistId: string, songId: string) => Promise<void>;
  playlistRemoveSong: (playlistId: string, songId: string) => Promise<void>;
  addPlaylist: (newPlaylistName: string, songIds: string[]) => Promise<void>;
  clearCacheData: () => void; // New function to clear all cached data
};

const CACHE_TTL = 4 * 60 * 60 * 1000; // Cache TTL in milliseconds (4 hour)

const useFirestoreMethods = (): UseFirestoreMethodsHookResult => {
  const isMounted = useIsMounted();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    getAppConfig,
    getUserAppConfig,
    getSongsByUserId,
    getSongById,
    getPlaylistsByUserId,
    getPlaylistById,
    getAllArtists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    addNewPlaylist,
  } = useFirestore();

  const { state, dispatch } = useAppContext();

  const loadAppConfigData = async (id: string) => {
    setIsLoading(true);
    const cacheKey = `appConfig-${id}`;
    const cachedConfig = getCache(cacheKey);
    if (cachedConfig) {
      dispatch(updateAppConfig(cachedConfig));
    } else {
      const config = await getAppConfig(id);
      if (isMounted()) {
        dispatch(updateAppConfig(config));

        setCache(cacheKey, config, CACHE_TTL);
      }
    }
    setIsLoading(false);
  };

  const loadUserAppConfigData = async () => {
    setIsLoading(true);
    const cacheKey = `userAppConfig`;
    const cachedConfig = getCache(cacheKey);
    if (cachedConfig) {
      dispatch(updateUserAppConfig(cachedConfig));
    } else {
      if (state.user && state.user.uid) {
        const config = await getUserAppConfig(state.user.uid);
        if (isMounted()) {
          dispatch(updateUserAppConfig(config));
          setCache(cacheKey, config, CACHE_TTL);
        }
      }
    }
    setIsLoading(false);
  };

  const loadArtistData = async () => {
    setIsLoading(true);
    const cacheKey = `artists`;
    const cachedArtists = getCache(cacheKey);
    if (cachedArtists) {
      dispatch(setArtists(cachedArtists));
    } else {
      const artists = await getAllArtists();
      if (isMounted()) {
        dispatch(setArtists(artists));
        setCache(cacheKey, artists, CACHE_TTL);
      }
    }
    setIsLoading(false);
  };

  const loadUserSongData = async () => {
    setIsLoading(true);
    if (state.user && state.user.uid) {
      const cacheKeySongs = `userSongs`;
      const cacheKeyArtists = `artists`;

      const cachedSongs = getCache(cacheKeySongs);
      const cachedArtists = getCache(cacheKeyArtists);

      if (cachedSongs && cachedArtists) {
        dispatch(setSongs(cachedSongs));
        dispatch(setArtists(cachedArtists));
      } else {
        const { songs } = await getSongsByUserId(state.user.uid);

        if (isMounted()) {
          // instead of loading the artists, use the artists from the loaded songs instead
          // get all artist (can include duplicates)
          const artistsWithDuplicates = songs.map(song => song.artist);

          // filter out the duplicates
          const artistsUnsorted = artistsWithDuplicates.filter(
            (artist, i, arr) => arr.findIndex(t => t.id === artist.id) === i
          );

          // and sort artists
          const artists = artistsUnsorted.sort((x, y) =>
            x.name.localeCompare(y.name)
          );

          // and sort songs
          const sortedSongs = songs.sort((x, y) =>
            x.title.localeCompare(y.title)
          );

          dispatch(setSongs(sortedSongs));
          dispatch(setArtists(artists));

          setCache(cacheKeySongs, sortedSongs, CACHE_TTL);
          setCache(cacheKeyArtists, artists, CACHE_TTL);
        }
      }
    }
    setIsLoading(false);
  };

  const loadUserPlaylistData = async () => {
    setIsLoading(true);
    const cacheKey = `userPlaylists`;
    const cachedPlaylists = getCache(cacheKey);
    if (cachedPlaylists) {
      dispatch(setPlaylists(cachedPlaylists));
    } else {
      if (state.user && state.user.uid) {
        const { playlists } = await getPlaylistsByUserId(state.user.uid);
        if (isMounted()) {
          dispatch(setPlaylists(playlists));
          setCache(cacheKey, playlists, CACHE_TTL);
        }
      }
    }
    setIsLoading(false);
  };

  const loadSongData = async (songId: string) => {
    setIsLoading(true);
    const cacheKeySongs = `userSongs`;
    const cacheKeyArtists = `artists`;
    const cachedSongs = getCache(cacheKeySongs) as ISong[];
    if (cachedSongs) {
      const itemIndex = cachedSongs.findIndex(item => item.id === songId);
      if (itemIndex !== -1) {
        const cachedSong = cachedSongs[itemIndex];
        dispatch(addOrUpdateSongs([cachedSong]));
      }
    } else {
      const song = await getSongById(songId);

      // Update the song array
      const updatedSongs = addOrUpdateSongInArray(state.songs, song);

      // Dispatch setSongs action to update the entire song array
      dispatch(setSongs(updatedSongs));

      // Update the artist array
      const updatedArtists = addOrUpdateArtistInArray(
        state.artists,
        song.artist
      );

      // Dispatch setArtists action to update the entire artist array
      dispatch(setArtists(updatedArtists));

      setCache(cacheKeySongs, updatedSongs, CACHE_TTL);
      setCache(cacheKeyArtists, updatedArtists, CACHE_TTL);
    }
    setIsLoading(false);
  };

  const loadPlaylistData = async (playlistId: string) => {
    setIsLoading(true);
    const cacheKey = `userPlaylists`;
    const cachedPlaylists = getCache(cacheKey) as IPlaylist[];
    if (cachedPlaylists) {
      const itemIndex = cachedPlaylists.findIndex(
        item => item.id === playlistId
      );
      if (itemIndex !== -1) {
        const cachedSong = cachedPlaylists[itemIndex];
        dispatch(addOrUpdatePlaylists([cachedSong]));
      }
    } else {
      const playlist = await getPlaylistById(playlistId);

      // Update the playlist array
      const updatedPlaylists = addOrUpdatePlaylistInArray(
        state.playlists,
        playlist
      );

      // Dispatch setPlaylists action to update the entire playlists array
      dispatch(setPlaylists(updatedPlaylists));

      setCache(cacheKey, updatedPlaylists, CACHE_TTL);
    }
    setIsLoading(false);
  };

  const hasPlaylistContainsSong = (playlistId: string, songId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    return playlist?.songIds.includes(songId) || false;
  };

  const playlistAddSong = async (playlistId: string, songId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    const song = state.songs.find(s => s.id === songId);
    if (playlist && song) {
      await addSongToPlaylist(playlistId, songId);
      const updatedPlaylists = state.playlists.map(p =>
        p.id === playlistId ? { ...p, songIds: [...p.songIds, songId] } : p
      );
      dispatch(setPlaylists(updatedPlaylists));
      const cacheKey = `userPlaylists`;
      setCache(cacheKey, updatedPlaylists, CACHE_TTL);
    }
  };

  const playlistRemoveSong = async (playlistId: string, songId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (playlist) {
      await removeSongFromPlaylist(playlistId, songId);
      const updatedPlaylists = state.playlists.map(p =>
        p.id === playlistId
          ? { ...p, songIds: p.songIds.filter(id => id !== songId) }
          : p
      );
      dispatch(setPlaylists(updatedPlaylists));
      const cacheKey = `userPlaylists`;
      setCache(cacheKey, updatedPlaylists, CACHE_TTL);
    }
  };

  const addPlaylist = async (newPlaylistName: string, songIds: string[]) => {
    if (newPlaylistName && state.user && state.user.uid) {
      const newPlaylist = await addNewPlaylist(
        {
          uid: state.user.uid!,
          email: state.user.email!,
          displayName: state.user.displayName!,
        },
        newPlaylistName,
        songIds
      );

      // Update the playlist array
      const updatedPlaylists = addPlaylistToArray(state.playlists, newPlaylist);

      // Dispatch setPlaylists action to update the entire playlists array
      dispatch(setPlaylists(updatedPlaylists));

      // Optionally, update the cache with the new playlists
      const cacheKey = `userPlaylists`;
      setCache(cacheKey, updatedPlaylists, CACHE_TTL);
    }
  };

  // Function to clear all cache
  const clearCacheData = () => {
    clearCache("appConfig");
    clearCache("userAppConfig");
    clearCache("artists");
    clearCache("userSongs");
    clearCache("userPlaylists");
  };

  return {
    isLoading,
    loadAppConfigData,
    loadUserAppConfigData,
    loadArtistData,
    loadUserSongData,
    loadUserPlaylistData,
    loadSongData,
    loadPlaylistData,
    hasPlaylistContainsSong,
    playlistAddSong,
    playlistRemoveSong,
    addPlaylist,
    clearCacheData,
  };
};

export default useFirestoreMethods;
