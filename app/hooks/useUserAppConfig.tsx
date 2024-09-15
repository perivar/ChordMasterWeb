import useAppContext from "./useAppContext";

const useUserAppConfig = () => {
  const { state } = useAppContext();
  return state.userAppConfig;
};

export default useUserAppConfig;
