import { useQuery } from "@tanstack/react-query";

import useFirestore from "./useFirestore";

export function useFirestoreQueryCache(userId?: string) {
  const { getSongsByUserId } = useFirestore();

  const queryResult = useQuery({
    queryKey: ["songs", userId], // Key based on userId, ensure it's unique across the app
    queryFn: async () => {
      // return { songs: dummySongList };
      return await getSongsByUserId(userId!);
    },
    enabled: !!userId, // Only fetch when userId is available
  });

  const { data, dataUpdatedAt, isError, error } = queryResult;

  return {
    documents: data?.songs ?? [],
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    isError,
    error,
  };
}
