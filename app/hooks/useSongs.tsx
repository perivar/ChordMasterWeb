import { useAppContext } from "~/context/AppContext";

const useSongs = () => {
  const { state } = useAppContext();
  return state.songs;
};

export default useSongs;
