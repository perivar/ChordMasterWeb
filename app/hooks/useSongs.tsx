import useAppContext from "./useAppContext";

const useSongs = () => {
  const { state } = useAppContext();
  return state.songs;
};

export default useSongs;
