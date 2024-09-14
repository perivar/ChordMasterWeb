import useAppContext from "./useAppContext";

const useArtists = () => {
  const { state } = useAppContext();
  return state.artists;
};

export default useArtists;
