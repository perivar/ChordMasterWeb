import { auth, db } from "~/firebase-service";
import deepmerge from "deepmerge";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  endAt,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  Query,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  startAt,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export type UseFirestore = ReturnType<typeof useFirestore>;

export type IAuthUser = {
  uid: string;
  displayName: string;
  email: string;
  avatar?: string; // image url
  token?: string; // expo token for notifications
  roles?: string[]; // roles that determine access to app

  // apple credential variables
  appleAuthorizationCode?: string;
  appleUser?: string;
};

export interface UserCredentials extends IAuthUser {
  createdAt?: Timestamp;
  updatedAt: Timestamp;
}

export interface IAppConfig {
  id?: string;
}

export interface IUserAppConfig {
  id?: string;

  user?: IUser;

  language: string;
  fontSize: number;
  showTablature: boolean;
  enablePageTurner: boolean;
}

export interface IUser {
  uid: string;
  email?: string;
  displayName?: string;
}

export interface IArtist {
  id?: string;
  name: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ISong {
  id?: string;

  user?: IUser;

  artist: IArtist;
  title: string;
  content: string;

  // special query fields
  // title_lower?: string;
  // title_partial?: string;
  // artist_lower?: string;
  // artist_partial?: string;

  transposeAmount?: number;
  fontSize?: number;
  showTablature?: boolean;
  published?: boolean;

  external: {
    id: string; //
    url: string; //
    source: string; //
  };

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface IPlaylist {
  id?: string;

  user?: IUser;

  name: string;
  songIds: string[];
  songs?: ISong[]; // when reading this is filled in

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const debug = (text: string, ...args: any[]) => {
  console.log("\n-----------------\n" + text, ...args);
};

const useFirestore = (errorCallback?: (error: string) => void) => {
  const currentUser = auth.currentUser;

  //#region User Region
  const subscribeToUserChange = (
    userId: string,
    updateUser: (userInfo: IAuthUser) => void
  ) => {
    const userRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(
      userRef,
      userDoc => {
        if (userDoc.exists()) {
          const userCredentials = userDoc.data() as UserCredentials;
          debug("subscribeToUserChange - user changed: ", userCredentials);
          const userInfo: IAuthUser = {
            uid: userCredentials.uid,
            displayName: userCredentials.displayName,
            email: userCredentials.email,
            avatar: userCredentials.avatar,
            token: userCredentials.token,
            roles: userCredentials.roles,

            // apple credential variables
            appleAuthorizationCode: userCredentials.appleAuthorizationCode,
            appleUser: userCredentials.appleUser,
          };
          updateUser(userInfo);
        }
      },
      error => {
        // this might throw 'Missing or insufficient permissions' when logging out
        // since the the non user will not have access to the user collection
        debug("error:", error);
        errorCallback?.(JSON.stringify(error));
        // throw error;
      }
    );
    return unsubscribe;
  };

  const getUserDetails = async (uid: string) => {
    try {
      const userDocument = await getDoc(doc(db, `/users/${uid}`));

      if (userDocument.exists()) {
        const userData = userDocument.data() as UserCredentials;
        return userData;
      }
      throw new Error(`User cannot be found (${uid})`);
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const addTokenToUser = async (token: string) => {
    const id = currentUser?.uid;
    try {
      if (!token) {
        debug("Token is empty - ignoring adding to firestore!");
        return;
      }

      if (!id) {
        debug("User id is empty - ignoring adding to firestore!");
        return;
      }

      // store token in separate token collection
      // const tokenRef = doc(db, 'tokens', user.uid);
      // setDoc(tokenRef, { token: token, id: user.uid }).then(() => {
      //   debug('Successfully added token to firestore.');
      // });

      // store token as a part of the user object
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { token: token });

      debug("Successfully added token to firestore: ", token);
    } catch (error) {
      debug(`Failed adding token to user with id ${id}`, error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };
  //#endregion

  //#region Artist Region
  const addNewArtist = async (name: string) => {
    try {
      const now = serverTimestamp() as Timestamp;

      const newArtist: IArtist = {
        name,

        createdAt: now,
      };

      const responseArtist: IArtist = {
        ...newArtist,
      };

      const document = await addDoc(collection(db, "artists"), newArtist);

      const { id: artistId } = document;
      responseArtist.id = artistId;

      debug(`Artist ${artistId} added successfully`);
      return responseArtist;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const editArtist = async (
    id: string,

    name: string
  ) => {
    try {
      const now = serverTimestamp() as Timestamp;

      const updateArtist: IArtist = {
        id,
        name,

        updatedAt: now,
      };

      await updateDoc(doc(db, `/artists/${id}`), {
        ...updateArtist,
      });

      debug(`Artist ${id} updated successfully`);
      return updateArtist;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const deleteArtist = async (id: string) => {
    try {
      const artistDocument = await getDoc(doc(db, `/artists/${id}`));

      if (!artistDocument.exists()) {
        debug("Artist not found");
        return;
      }

      // delete artist document
      await deleteDoc(doc(db, `/artists/${id}`));

      debug(`Artist ${id} deleted successfully`);
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getAllArtists = async () => {
    try {
      const artists: IArtist[] = [];

      const artistQuery = query(
        collection(db, "artists"),
        orderBy("createdAt")
      );

      const artistsSnapshots = await getDocs(artistQuery);

      artistsSnapshots.forEach(artistSnapshot => {
        const data = artistSnapshot.data() as IArtist;
        artists.push({
          id: artistSnapshot.id,

          name: data.name,

          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      return artists;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getArtistById = async (artistId: string) => {
    try {
      const artistDocument = await getDoc(doc(db, `/artists/${artistId}`));

      if (!artistDocument.exists()) {
        throw new Error("Artist not found");
      }

      const data = artistDocument.data();
      const artist: IArtist = {
        id: artistDocument.id,

        name: data.name,

        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      debug(`Artist ${artistId} retrieved successfully`);
      return artist;
    } catch (error) {
      debug(`Get Artist using id: ${artistId} failed:`, error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getArtistsByName = async (name: string) => {
    try {
      const artists: IArtist[] = [];

      const artistQuery = query(
        collection(db, "artists"),
        where("name", "==", name)
      );

      const artistsSnapshots = await getDocs(artistQuery);

      artistsSnapshots.forEach(artistSnapshot => {
        const data = artistSnapshot.data() as IArtist;
        artists.push({
          id: artistSnapshot.id,

          name: data.name,

          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      return artists;
    } catch (error) {
      debug(`Get Artist using name: ${name} failed:`, error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const updateSongsWithArtists = async (songs: ISong[]) => {
    const artistPromises: Promise<DocumentSnapshot<DocumentData>>[] = [];

    if (songs && songs.length > 0) {
      songs.forEach(song => {
        if (song.artist && song.artist.id) {
          artistPromises.push(getDoc(doc(db, "artists", song.artist.id)));
        }
      });

      const artistsSnapshots = await Promise.all(artistPromises);

      // create map of artistId and artist
      const artistMap = new Map<string, IArtist>();
      artistsSnapshots.forEach(artistSnapshot => {
        if (artistSnapshot.exists()) {
          const artistData = artistSnapshot.data() as IArtist;
          if (artistData.id) {
            artistMap.set(artistData.id, artistData);
          }
        }
      });

      // update song list with correct artist where found
      songs.map(song => {
        // lookup artist info
        if (song.artist && song.artist.id) {
          const artistId = song.artist.id;
          if (artistMap.has(artistId)) {
            const artistData = artistMap.get(artistId);
            if (artistData && artistData.id && artistData?.name) {
              song.artist.id = artistData.id;
              song.artist.name = artistData.name;
              // song.artist.createdAt = artistData.createdAt;
              // song.artist.updatedAt = artistData.updatedAt;
            }
          }
        }
      });
    }

    return songs;
  };
  //#endregion

  //#region Song Region
  // const getPartialTitle = (title: string): string => {
  //   const parts = title.split(' ');
  //   if (parts.length > 1) {
  //     parts.shift();
  //     return parts.join(' ').toLowerCase();
  //   } else {
  //     return title.toLowerCase();
  //   }
  // };

  const addNewSong = async (
    user: IUser,

    artist: IArtist,
    title: string,
    content: string,

    externalId?: string,
    externalUrl?: string,
    externalSource?: string
  ) => {
    try {
      const now = serverTimestamp() as Timestamp;

      const newSong: ISong = {
        user,

        artist,
        title,
        content,

        // special query fields
        // title_lower: title.toLowerCase(),
        // title_partial: getPartialTitle(title),
        // artist_lower: artist!.name!.toLowerCase(),
        // artist_partial: getPartialTitle(artist!.name!),

        external: {
          id: externalId ?? "",
          url: externalUrl ?? "",
          source: externalSource ?? "",
        },

        createdAt: now,
      };

      const responseSong: ISong = {
        ...newSong,
      };

      const document = await addDoc(collection(db, "songs"), newSong);

      const { id: songId } = document;
      responseSong.id = songId;

      debug(`Song ${songId} added successfully`);
      return responseSong;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const editSong = async (
    id: string,

    artist: IArtist,
    title: string,
    content: string,

    externalId?: string,
    externalUrl?: string,
    externalSource?: string
  ) => {
    try {
      const now = serverTimestamp() as Timestamp;

      const updateSong: ISong = {
        id,
        artist,
        title,
        content,

        // special query fields
        // title_lower: title.toLowerCase(),
        // title_partial: getPartialTitle(title),
        // artist_lower: artist!.name!.toLowerCase(),
        // artist_partial: getPartialTitle(artist!.name!),

        external: {
          id: externalId ?? "",
          url: externalUrl ?? "",
          source: externalSource ?? "",
        },

        updatedAt: now,
      };

      await updateDoc(doc(db, `/songs/${id}`), {
        ...updateSong,
      });

      debug(`Song ${id} updated successfully`);
      return updateSong;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const deleteSong = async (id: string) => {
    try {
      const songDocument = await getDoc(doc(db, `/songs/${id}`));

      if (!songDocument.exists()) {
        debug("Song not found");
        return;
      }

      // delete song document
      await deleteDoc(doc(db, `/songs/${id}`));

      debug(`Song ${id} deleted successfully`);
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getAllSongs = async () => {
    try {
      let songs: ISong[] = [];

      const songQuery = query(collection(db, "songs"), orderBy("createdAt"));

      const songsSnapshots = await getDocs(songQuery);

      songsSnapshots.forEach(songSnapshot => {
        const data = songSnapshot.data() as ISong;
        songs.push({
          id: songSnapshot.id,

          user: data.user,

          artist: data.artist,
          title: data.title,
          content: data.content,

          transposeAmount: data.transposeAmount,
          fontSize: data.fontSize,
          showTablature: data.showTablature,
          published: data.published,

          external: data.external,

          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      // update artists for the songs
      songs = await updateSongsWithArtists(songs);

      return songs;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getSongById = async (songId: string) => {
    try {
      const songDocument = await getDoc(doc(db, `/songs/${songId}`));

      if (!songDocument.exists()) {
        throw new Error("Song not found");
      }

      const data = songDocument.data();
      const song: ISong = {
        id: songDocument.id,

        user: data.user,

        artist: data.artist,
        title: data.title,
        content: data.content,

        transposeAmount: data.transposeAmount,
        fontSize: data.fontSize,
        showTablature: data.showTablature,
        published: data.published,

        external: data.external,

        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      try {
        if (song.artist && song.artist.id) {
          // retrieve artist
          const artist = await getArtistById(song.artist.id);
          if (artist) {
            song.artist = artist;
          }
        }
      } catch (error) {
        debug("Retrieving song artist failed:", error);
      }

      debug(`Song ${songId} retrieved successfully`);
      return song;
    } catch (error) {
      debug(`Get Song using id: ${songId} failed:`, error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getSongsByUserId = async (
    userId: string,
    limitCount?: number,
    startAfterId?: QueryDocumentSnapshot<DocumentData>,
    invertOwner = false, // change the behavior to the exact opposite, only get songs that the userId does not own,
    onlyPublished = false // only include published songs
  ) => {
    try {
      let songs: ISong[] = [];

      let songsQuery = query(
        collection(db, "songs"),
        where("user.uid", invertOwner ? "!=" : "==", userId)
      );

      if (limitCount) {
        songsQuery = query(songsQuery, limit(limitCount));
      }

      if (onlyPublished) {
        songsQuery = query(songsQuery, where("published", "==", true));
      }

      if (startAfterId && startAfterId.id) {
        songsQuery = query(songsQuery, startAfter(startAfterId));
      }

      const songsSnapshots = await getDocs(songsQuery);

      // Get the last visible document
      if (songsSnapshots && songsSnapshots.size > 0) {
        const lastVisible = songsSnapshots.docs[songsSnapshots.docs.length - 1];

        songsSnapshots.forEach(songSnapshot => {
          const data = songSnapshot.data();
          songs.push({
            id: songSnapshot.id,
            user: data.user,

            artist: data.artist,
            title: data.title,
            content: data.content,

            transposeAmount: data.transposeAmount,
            fontSize: data.fontSize,
            showTablature: data.showTablature,
            published: data.published,

            external: data.external,

            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });

        // update artists for the songs
        songs = await updateSongsWithArtists(songs);

        return { lastVisible, songs };
      } else {
        return { lastVisible: undefined, songs };
      }
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getSongsByQueryInternal = async (
    userId: string,
    field: string,
    term?: string,
    isModeOpposite = false // change the behavior to the exact opposite, only get songs that the userId does not own
  ) => {
    try {
      // search field using value
      let songsQuery = query(
        collection(db, "songs"),
        where("user.uid", isModeOpposite ? "!=" : "==", userId),
        orderBy(field)
      );

      if (term && term !== "") {
        songsQuery = query(songsQuery, startAt(term), endAt(term + "\uf8ff"));
      }

      const songsSnapshots = await getDocs(songsQuery);

      const songs: ISong[] = [];

      if (songsSnapshots && songsSnapshots.size > 0) {
        songsSnapshots.forEach(songSnapshot => {
          const data = songSnapshot.data();
          songs.push({
            id: songSnapshot.id,
            user: data.user,

            artist: data.artist,
            title: data.title,
            content: data.content,

            transposeAmount: data.transposeAmount,
            fontSize: data.fontSize,
            showTablature: data.showTablature,
            published: data.published,

            external: data.external,

            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
      }

      return songs;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  // Note that method requires the special query fields *_lower and _partial
  const getSongsByQuery = async (
    userId: string,
    searchQuery: string,
    isModeOpposite = false // change the behavior to the exact opposite, only get songs that the userId does not own
  ) => {
    try {
      const term = searchQuery.toLowerCase();

      const songsLower = await getSongsByQueryInternal(
        userId,
        "title_lower",
        term,
        isModeOpposite
      );
      const songsPartial = await getSongsByQueryInternal(
        userId,
        "title_partial",
        term,
        isModeOpposite
      );

      // merge the two results
      const foundSongsUsingTitle = deepmerge(songsLower, songsPartial);

      const songsArtistLower = await getSongsByQueryInternal(
        userId,
        "artist_lower",
        term,
        isModeOpposite
      );
      const songsArtistPartial = await getSongsByQueryInternal(
        userId,
        "artist_partial",
        term,
        isModeOpposite
      );

      // merge the two results
      const foundSongsUsingArtist = deepmerge(
        songsArtistLower,
        songsArtistPartial
      );

      // merge
      const foundSongs = deepmerge(foundSongsUsingTitle, foundSongsUsingArtist);

      // filter out the duplicates
      const foundSongsUnique = foundSongs.filter(
        (thing, index, self) =>
          index === self.findIndex(t => t.title === thing.title)
      );

      // update artists for the songs
      const resultingSongs = await updateSongsWithArtists(foundSongsUnique);

      return resultingSongs;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const setSongPreferences = async (
    id: string,
    preferences: {
      showTablature?: boolean;
      fontSize?: number;
      transposeAmount?: number;
      published?: boolean;
    }
  ) => {
    try {
      const now = serverTimestamp() as Timestamp;

      // add using existing id
      await setDoc(
        doc(db, "songs", id),
        {
          ...preferences,
          updatedAt: now,
        },
        { merge: true }
      );

      debug(`Song ${id} updated successfully with preferences`);
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };
  //#endregion

  //#region Playlist Region
  const addNewPlaylist = async (
    user: IUser,

    name: string,
    songIds: string[]
  ) => {
    try {
      const now = serverTimestamp() as Timestamp;

      const newPlaylist: IPlaylist = {
        user,

        name,
        songIds,

        createdAt: now,
      };

      const responsePlaylist: IPlaylist = {
        ...newPlaylist,
      };

      const document = await addDoc(collection(db, "playlists"), newPlaylist);

      const { id: playlistId } = document;
      responsePlaylist.id = playlistId;

      debug(`Playlist ${playlistId} added successfully`);
      return responsePlaylist;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const editPlaylist = async (
    id: string,

    name: string,
    songIds: string[]
  ) => {
    try {
      const now = serverTimestamp() as Timestamp;

      const updatePlaylist: IPlaylist = {
        id,

        name,
        songIds,

        updatedAt: now,
      };

      await updateDoc(doc(db, `/playlists/${id}`), {
        ...updatePlaylist,
      });

      debug(`Playlist ${id} updated successfully`);
      return updatePlaylist;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      const playlistDocument = await getDoc(doc(db, `/playlists/${id}`));

      if (!playlistDocument.exists()) {
        debug("Playlist not found");
        return;
      }

      // delete playlist document
      await deleteDoc(doc(db, `/playlists/${id}`));

      debug(`Playlist ${id} deleted successfully`);
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getAllPlaylists = async () => {
    try {
      const playlists: IPlaylist[] = [];

      const playlistQuery = query(
        collection(db, "playlists"),
        orderBy("createdAt")
      );

      const playlistsSnapshots = await getDocs(playlistQuery);

      playlistsSnapshots.forEach(playlistSnapshot => {
        const data = playlistSnapshot.data() as IPlaylist;
        playlists.push({
          id: playlistSnapshot.id,

          user: data.user,

          name: data.name,
          songIds: data.songIds,

          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      return playlists;
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getPlaylistById = async (playlistId: string) => {
    try {
      const playlistDocument = await getDoc(
        doc(db, `/playlists/${playlistId}`)
      );

      if (!playlistDocument.exists()) {
        throw new Error("Playlist not found");
      }

      const data = playlistDocument.data();
      const playlist: IPlaylist = {
        id: playlistDocument.id,

        user: data.user,

        name: data.name,
        songIds: data.songIds,

        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      debug(`Playlist ${playlistId} retrieved successfully`);
      return playlist;
    } catch (error) {
      debug(`Get Playlist using id: ${playlistId} failed:`, error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const getPlaylistsByUserId = async (
    userId: string,
    limitCount?: number,
    startAfterId?: QueryDocumentSnapshot<DocumentData>
  ) => {
    try {
      const playlists: IPlaylist[] = [];

      let playlistsQuery = query(
        collection(db, "playlists"),
        where("user.uid", "==", userId)
      );

      if (limitCount) {
        playlistsQuery = query(playlistsQuery, limit(limitCount));
      }

      if (startAfterId && startAfterId.id) {
        playlistsQuery = query(playlistsQuery, startAfter(startAfterId));
      }

      const playlistsSnapshots = await getDocs(playlistsQuery);

      // Get the last visible document
      if (playlistsSnapshots && playlistsSnapshots.size > 0) {
        const lastVisible =
          playlistsSnapshots.docs[playlistsSnapshots.docs.length - 1];

        playlistsSnapshots.forEach(playlistSnapshot => {
          const data = playlistSnapshot.data();
          playlists.push({
            id: playlistSnapshot.id,
            user: data.user,

            name: data.name,
            songIds: data.songIds,

            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });

        return { lastVisible, playlists };
      } else {
        return { lastVisible: undefined, playlists };
      }
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    try {
      const playlistRef = doc(db, `/playlists/${playlistId}`);

      // Atomically add a new song to the "songIds" array field.
      await updateDoc(playlistRef, {
        songIds: arrayUnion(songId),
      });

      debug(
        `Playlist ${playlistId} updated successfully with adding ${songId} `
      );
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      const playlistRef = doc(db, `/playlists/${playlistId}`);

      // Atomically add a new song to the "songIds" array field.
      await updateDoc(playlistRef, {
        songIds: arrayRemove(songId),
      });

      debug(
        `Playlist ${playlistId} updated successfully with removing ${songId} `
      );
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };
  //#endregion

  //#region UserAppConfig Region
  const getUserAppConfig = async (userId: string) => {
    try {
      // debug('Trying to read userAppConfig using id', userId);
      const userAppConfigDoc = await getDoc(doc(db, "userAppConfig", userId));

      if (userAppConfigDoc.exists()) {
        // debug(`Found user app config document with id ${userId}`);

        const userAppConfig = userAppConfigDoc.data() as IUserAppConfig;
        userAppConfig.id = userAppConfigDoc.id;

        // debug('userAppConfig', userAppConfig);
        return userAppConfig;
      } else {
        throw new Error(`userAppConfig cannot be found (id: ${userId})`);
      }
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const updateUserAppConfig = async (
    userId: string,
    userAppConfig: {
      language?: string;
      fontSize?: number;
      showTablature?: boolean;
      enablePageTurner?: boolean;
    }
  ) => {
    try {
      const now = serverTimestamp() as Timestamp;

      // add using existing id
      await setDoc(
        doc(db, "userAppConfig", userId),
        {
          ...userAppConfig,
          updatedAt: now,
        },
        { merge: true }
      );

      debug(`UserAppConfig ${userId} updated successfully`);
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };
  //#endregion

  //#region AppConfig Region
  const getAppConfig = async (id: string) => {
    try {
      // debug('Trying to read appConfig using id', id);
      const appConfigDoc = await getDoc(doc(db, "appConfig", id));

      if (appConfigDoc.exists()) {
        // debug(`Found app config document with id ${id}`);

        const appConfig = appConfigDoc.data() as IAppConfig;
        appConfig.id = appConfigDoc.id;

        // debug('appConfig', appConfig);
        return appConfig;
      } else {
        throw new Error(`AppConfig cannot be found (id: ${id})`);
      }
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };

  const updateAppConfig = async (appConfig: IAppConfig) => {
    try {
      if (appConfig.id) {
        await updateDoc(doc(db, "appConfig", appConfig.id), { ...appConfig });
        debug(`AppConfig ${appConfig.id} updated successfully`);
        return appConfig;
      } else {
        throw new Error("AppConfig.id is empty");
      }
    } catch (error) {
      debug("error:", error);
      errorCallback?.(JSON.stringify(error));
      throw error;
    }
  };
  //#endregion

  //#region
  // add a field and value to a firestore table
  // optionally use a queryConstraint to only include some of the table elements
  // e.g. where('user.uid', '==', user.uid);
  const bulkAddFieldToSongs = async (
    tableName: string,
    fieldName: string,
    fieldValue: unknown,
    queryConstraint?: QueryConstraint
  ) => {
    const limitCount = 50;

    let itemsCollection: Query = collection(db, tableName);

    // add query constraint if it was passed,
    // e.g.
    // const queryConstraint = where('user.uid', '==', user.uid);
    if (queryConstraint) {
      itemsCollection = query(itemsCollection, queryConstraint);
    }

    let allItemsResult = await getDocs(
      query(itemsCollection, limit(limitCount))
    );

    let read = allItemsResult.docs.length;

    while (read > 0) {
      // Get a new write batch
      const batch = writeBatch(db);

      let updated = 0;

      allItemsResult.docs.forEach(queryResult => {
        const data = queryResult.data();

        if (
          !data.hasOwnProperty(fieldName) ||
          (data.hasOwnProperty(fieldName) && data[fieldName] !== fieldValue)
        ) {
          updated++;

          batch.update(queryResult.ref, fieldName, fieldValue);
        }
      });

      await batch.commit();
      debug(`Updated ${updated} of ${read} items!`);

      const lastVisible = allItemsResult.docs[read - 1];

      allItemsResult = await getDocs(
        query(itemsCollection, startAfter(lastVisible), limit(limitCount))
      );

      read = allItemsResult.docs.length;
    }
  };
  //#endregion

  return {
    subscribeToUserChange,
    getUserDetails,
    addTokenToUser,

    // appConfig
    getAppConfig,
    updateAppConfig,

    // userAppConfig
    getUserAppConfig,
    updateUserAppConfig,

    // artist
    addNewArtist,
    editArtist,
    deleteArtist,
    getAllArtists,
    getArtistById,
    getArtistsByName,

    // song
    addNewSong,
    editSong,
    deleteSong,
    getAllSongs,
    getSongById,
    getSongsByUserId,
    setSongPreferences,
    getSongsByQuery,

    // playlist
    addNewPlaylist,
    editPlaylist,
    deletePlaylist,
    getAllPlaylists,
    getPlaylistById,
    getPlaylistsByUserId,
    addSongToPlaylist,
    removeSongFromPlaylist,
    bulkAddFieldToSongs,
  };
};

export default useFirestore;
