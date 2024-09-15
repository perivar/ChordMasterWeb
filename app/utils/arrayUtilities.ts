// playlistUtils.ts
import { IArtist, IPlaylist, ISong } from "~/hooks/useFirestore";

//#region Generic Utility Methods
// This constraint ensures that T has an "id" property
interface Identifiable {
  id: string;
}

// Generic utility function to add an item in an array
export const addItemToArray = <T extends Partial<Identifiable>>(
  array: T[],
  newItem: T
): T[] => {
  const updatedArray = [...array];

  // Add new item
  updatedArray.push(newItem);

  return updatedArray;
};

// Generic utility function to add or update an item in an array
export const addOrUpdateItemInArray = <T extends Partial<Identifiable>>(
  array: T[],
  newItem: T
): T[] => {
  const updatedArray = [...array];
  const itemIndex = updatedArray.findIndex(item => item.id === newItem.id);

  if (itemIndex !== -1) {
    // Update existing item
    updatedArray[itemIndex] = { ...updatedArray[itemIndex], ...newItem };
  } else {
    // Add new item
    updatedArray.push(newItem);
  }

  return updatedArray;
};

// Generic utility function to set or update multiple items in an array
export const addOrUpdateItemsInArray = <T extends Partial<Identifiable>>(
  array: T[],
  newItems: T[]
): T[] => {
  let updatedArray = [...array];

  newItems.forEach(newItem => {
    updatedArray = addOrUpdateItemInArray(updatedArray, newItem);
  });

  return updatedArray;
};

// Generic utility function to edit an item in an array
export const editItemInArray = <T extends Partial<Identifiable>>(
  array: T[],
  editedItem: T
): T[] => {
  const updatedArray = [...array];
  const itemIndex = updatedArray.findIndex(item => item.id === editedItem.id);

  if (itemIndex !== -1) {
    updatedArray[itemIndex] = {
      ...updatedArray[itemIndex],
      ...editedItem,
    };
  }

  return updatedArray;
};

// Generic utility function to delete an item from an array
export const deleteItemFromArray = <T extends Partial<Identifiable>>(
  array: T[],
  itemId: string
): T[] => {
  return array.filter(item => item.id !== itemId);
};
//#endregion

//#region Song Methods
// Utility function to add song to an array
export const addSongToArray = (songs: ISong[], newSong: ISong): ISong[] => {
  return addItemToArray(songs, newSong);
};

// Utility function to add or update a song in an array
export const addOrUpdateSongInArray = (
  songs: ISong[],
  newSong: ISong
): ISong[] => {
  return addOrUpdateItemInArray(songs, newSong);
};

// Utility function to add or update multiple songs in an array
export const addOrUpdateSongsInArray = (
  songs: ISong[],
  newSongs: ISong[]
): ISong[] => {
  return addOrUpdateItemsInArray(songs, newSongs);
};

// Utility function to edit a song in the array
export const editSongInArray = (songs: ISong[], editedSong: ISong): ISong[] => {
  return editItemInArray(songs, editedSong);
};

// Utility function to delete a song from an array
export const deleteSongFromArray = (
  songs: ISong[],
  songId: string
): ISong[] => {
  return deleteItemFromArray(songs, songId);
};
//#endregion

//#region Playlist Methods
// Utility function to add playlist to an array
export const addPlaylistToArray = (
  playlists: IPlaylist[],
  newPlaylist: IPlaylist
): IPlaylist[] => {
  return addItemToArray(playlists, newPlaylist);
};

// Utility function to add or update a playlist in an array
export const addOrUpdatePlaylistInArray = (
  playlists: IPlaylist[],
  newPlaylist: IPlaylist
): IPlaylist[] => {
  return addOrUpdateItemInArray(playlists, newPlaylist);
};

// Utility function to add or update multiple playlists in an array
export const addOrUpdatePlaylistsInArray = (
  playlists: IPlaylist[],
  newPlaylists: IPlaylist[]
): IPlaylist[] => {
  return addOrUpdateItemsInArray(playlists, newPlaylists);
};

// Utility function to edit a playlist in the array
export const editPlaylistInArray = (
  playlists: IPlaylist[],
  editedPlaylist: IPlaylist
): IPlaylist[] => {
  return editItemInArray(playlists, editedPlaylist);
};

// Utility function to delete a playlist from an array
export const deletePlaylistFromArray = (
  playlists: IPlaylist[],
  playlistId: string
): IPlaylist[] => {
  return deleteItemFromArray(playlists, playlistId);
};
//#endregion

//#region Artist Methods
// Utility function to add playlist to an array
export const addArtistToArray = (
  artists: IArtist[],
  newArtist: IArtist
): IArtist[] => {
  return addItemToArray(artists, newArtist);
};

// Utility function to add or update an artist in an array
export const addOrUpdateArtistInArray = (
  artists: IArtist[],
  newArtist: IArtist
): IArtist[] => {
  return addOrUpdateItemInArray(artists, newArtist);
};

// Utility function to add or update multiple artists in an array
export const addOrUpdateArtistsInArray = (
  artists: IArtist[],
  newArtists: IArtist[]
): IArtist[] => {
  return addOrUpdateItemsInArray(artists, newArtists);
};

// Utility function to edit an artist in the array
export const editArtistInArray = (
  artists: IArtist[],
  editedArtist: IArtist
): IArtist[] => {
  return editItemInArray(artists, editedArtist);
};

// Utility function to delete an artist from an array
export const deleteArtistFromArray = (
  artists: IArtist[],
  artistId: string
): IArtist[] => {
  return deleteItemFromArray(artists, artistId);
};
//#endregion
