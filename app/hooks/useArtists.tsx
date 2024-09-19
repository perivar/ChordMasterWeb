import { useAppContext } from "~/context/AppContext";

const useArtists = () => {
  const { state } = useAppContext();
  return state.artists;
};

export default useArtists;
