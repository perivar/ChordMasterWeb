import { useAppContext } from "~/context/AppContext";

const usePlaylists = () => {
  const { state } = useAppContext();
  return state.playlists;
};

export default usePlaylists;
