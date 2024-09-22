import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "@firebase/auth";
import { useUser } from "~/context/UserContext";
import { auth } from "~/firebase-service";
import { Unsubscribe } from "firebase/firestore";

import useFirestore, { IAuthUser } from "./useFirestore";

const useFirebaseUser = () => {
  const { subscribeToUserChange } = useFirestore();

  const { loginUser, logoutUser } = useUser();

  // to store the user subscriber so we can unsubscribe later
  const userSnapShotUnsubscribeRef = useRef<Unsubscribe>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, authUser => {
      // debug('useFirebaseUser - onAuthStateChanged');
      if (authUser) {
        // provider-specific profile information is stored in the data.user.providerData array
        const user = authUser;

        const userInfo: IAuthUser = {
          uid: user?.uid ?? "",
          email: user?.email ?? "",
          displayName:
            user?.providerData[0]?.displayName ?? user?.displayName ?? "",
          avatar: user?.providerData[0]?.photoURL ?? user?.photoURL ?? "",
        };

        loginUser(userInfo);

        // subscribe to user change
        const id = userInfo.uid;
        userSnapShotUnsubscribeRef.current = subscribeToUserChange(
          id,
          (userUpdate: IAuthUser) => loginUser(userUpdate)
        );
      } else {
        // debug('useFirebaseUser - onAuthStateChanged - no authenticated user!');
        unsubscribe(); // add this here to avoid 'Missing or insufficient permissions' when logging out
        logoutUser();

        // when no network - login dummy user
        // const userInfo: User = {
        //   uid: '123456',
        //   displayName: 'Offline User',
        //   email: 'offline@user.com',
        // };
        // dispatch(loginUser(userInfo));
      }
    });
    // unsubscribe both listeners on unmount
    return () => {
      userSnapShotUnsubscribeRef.current?.();
      unsubscribe();
    };
  }, []);
};

export default useFirebaseUser;
