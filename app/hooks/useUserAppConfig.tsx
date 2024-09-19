import { useAppContext } from "~/context/AppContext";

const useUserAppConfig = () => {
  const { state } = useAppContext();
  return state.userAppConfig;
};

export default useUserAppConfig;
