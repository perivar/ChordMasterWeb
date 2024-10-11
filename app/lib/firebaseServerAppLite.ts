import { initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

// read firebase config from app config
import firebaseConfig from "../../firebase-config.json";

// Initialize Firebase
// console.log(
//   "Initialize Firebase Server App Lite: " + JSON.stringify(firebaseConfig)
// );
console.log(
  "Initialize Firebase Server App Lite for " + firebaseConfig.projectId
);

export const firebaseServerAppLite = async (request: Request) => {
  const authIdToken = request.headers.get("Authorization")?.split("Bearer ")[1];

  if (!authIdToken) {
    console.warn("Not Logged In! (no Authorization Bearer header found)");
  }

  const serverApp = initializeServerApp(firebaseConfig, {
    authIdToken,
  });

  const serverAuth = getAuth(serverApp);
  await serverAuth.authStateReady();

  if (serverAuth.currentUser === null) {
    console.warn("Invalid Token! (no currentUser found)");
  }

  const serverDB = getFirestore(serverApp);

  return {
    serverAuth,
    serverDB,
  };
};
