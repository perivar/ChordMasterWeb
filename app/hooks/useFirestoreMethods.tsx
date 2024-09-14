import { useState } from "react";
import { clearCache, getCache, setCache } from "~/utils/localStorageUtils";

import useAppContext from "./useAppContext";
import useFirestore from "./useFirestore";
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
  clearCacheData: () => void; // New function to clear all cached data
};

const CACHE_TTL = 4 * 60 * 60 * 1000; // Cache TTL in milliseconds (4 hour)

const useFirestoreMethods = (
  userId?: string
): UseFirestoreMethodsHookResult => {
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
  } = useFirestore();

  const { state, dispatch } = useAppContext();

  const loadAppConfigData = async (id: string) => {
    setIsLoading(true);
    const cacheKey = `appConfig-${id}`;
    const cachedConfig = getCache(cacheKey);
    if (cachedConfig) {
      dispatch({ type: "SET_APP_CONFIG", appConfig: cachedConfig });
    } else {
      const config = await getAppConfig(id);
      if (isMounted()) {
        dispatch({ type: "SET_APP_CONFIG", appConfig: config });
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
      dispatch({ type: "SET_USER_APP_CONFIG", userAppConfig: cachedConfig });
    } else {
      if (userId) {
        const config = await getUserAppConfig(userId);
        if (isMounted()) {
          dispatch({ type: "SET_USER_APP_CONFIG", userAppConfig: config });
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
      dispatch({ type: "SET_ARTISTS", artists: cachedArtists });
    } else {
      const artists = await getAllArtists();
      if (isMounted()) {
        dispatch({ type: "SET_ARTISTS", artists });
        setCache(cacheKey, artists, CACHE_TTL);
      }
    }
    setIsLoading(false);
  };

  // const loadUserSongData = async () => {
  //   setIsLoading(true);
  //   const cacheKey = `userSongs`;
  //   const cachedSongs = getCache(cacheKey);
  //   if (cachedSongs) {
  //     dispatch({ type: "SET_SONGS", songs: cachedSongs });
  //   } else {
  //     if (userId) {
  //       const { songs } = await getSongsByUserId(userId);
  //       if (isMounted()) {
  //         dispatch({ type: "SET_SONGS", songs });
  //         setCache(cacheKey, songs, CACHE_TTL);
  //       }
  //     }
  //   }
  //   setIsLoading(false);
  // };

  const loadUserSongData = async () => {
    setIsLoading(true);
    if (userId) {
      const cacheKeySongs = `userSongs`;
      const cacheKeyArtists = `artists`;

      const cachedSongs = getCache(cacheKeySongs);
      const cachedArtists = getCache(cacheKeyArtists);

      if (cachedSongs && cachedArtists) {
        dispatch({ type: "SET_SONGS", songs: cachedSongs });
        dispatch({ type: "SET_ARTISTS", artists: cachedArtists });
      } else {
        const { songs } = await getSongsByUserId(userId);

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

          dispatch({ type: "SET_SONGS", songs: sortedSongs });
          dispatch({ type: "SET_ARTISTS", artists });

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
      dispatch({ type: "SET_PLAYLISTS", playlists: cachedPlaylists });
    } else {
      if (userId) {
        const { playlists } = await getPlaylistsByUserId(userId);
        if (isMounted()) {
          dispatch({ type: "SET_PLAYLISTS", playlists });
          setCache(cacheKey, playlists, CACHE_TTL);
        }
      }
    }
    setIsLoading(false);
  };

  const loadSongData = async (songId: string) => {
    setIsLoading(true);
    const cacheKey = `song-${songId}`;
    const cachedSong = getCache(cacheKey);
    if (cachedSong) {
      dispatch({ type: "SET_SONGS", songs: [cachedSong] });
    } else {
      const song = await getSongById(songId);
      dispatch({ type: "SET_SONGS", songs: [song] });
      setCache(cacheKey, song, CACHE_TTL);
    }
    setIsLoading(false);
  };

  const loadPlaylistData = async (playlistId: string) => {
    setIsLoading(true);
    const cacheKey = `playlist-${playlistId}`;
    const cachedPlaylist = getCache(cacheKey);
    if (cachedPlaylist) {
      dispatch({ type: "SET_PLAYLISTS", playlists: [cachedPlaylist] });
    } else {
      const playlist = await getPlaylistById(playlistId);
      dispatch({ type: "SET_PLAYLISTS", playlists: [playlist] });
      setCache(cacheKey, playlist, CACHE_TTL);
    }
    setIsLoading(false);
  };

  const hasPlaylistContainsSong = (playlistId: string, songId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    return playlist?.songIds.includes(songId) || false;
  };

  const playlistAddSong = async (playlistId: string, songId: string) => {
    const playlist = state.playlists.find(p => p.id === playlistId);
    if (playlist) {
      await addSongToPlaylist(playlistId, songId);
      const updatedPlaylists = state.playlists.map(p =>
        p.id === playlistId ? { ...p, songIds: [...p.songIds, songId] } : p
      );
      dispatch({ type: "SET_PLAYLISTS", playlists: updatedPlaylists });
      setCache(
        `playlist-${playlistId}`,
        { ...playlist, songIds: [...playlist.songIds, songId] },
        CACHE_TTL
      );
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
      dispatch({ type: "SET_PLAYLISTS", playlists: updatedPlaylists });
      setCache(
        `playlist-${playlistId}`,
        { ...playlist, songIds: playlist.songIds.filter(id => id !== songId) },
        CACHE_TTL
      );
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
    clearCacheData,
  };
};

export default useFirestoreMethods;
