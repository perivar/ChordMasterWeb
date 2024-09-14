import useAppContext from "./useAppContext";

const usePlaylists = () => {
  const { state } = useAppContext();
  return state.playlists;
};

export default usePlaylists;
