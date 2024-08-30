// https://github.com/aaronksaunders/remix-firebase-sample-app/tree/main
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { ServiceAccount } from "firebase-admin";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase
// ---------------------
import serviceAccount from "../serviceAccountKey.json";

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
}

/**
 * setup the session cookie to be used for firebase
 */
type SessionData = {
  idToken: string;
};

type SessionFlashData = {
  error: string;
};

const isProduction = process.env.NODE_ENV === "production";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "fb:token",

      // all of these are optional
      // Expires can also be set (although maxAge overrides it when used in combination).
      // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
      //
      expires: new Date(Date.now() + 600),
      httpOnly: true,
      maxAge: 600,
      path: "/",
      sameSite: "lax",
      secrets: ["s3cr3t"],

      // Set domain and secure only if in production
      ...(isProduction
        ? { domain: "your-production-domain.com", secure: true }
        : {}),
    },
  });

/**
 * checks that the current session is a valid session be getting the token
 * from the session cookie and validating it with firebase
 *
 * @param {*} param0
 * @returns
 */
export const isSessionValid = async (request: Request) => {
  const session = await getSession(request.headers.get("cookie"));
  try {
    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    const idToken = session.get("idToken");
    if (idToken) {
      const decodedClaims = await getAuth().verifySessionCookie(
        idToken,
        true /** checkRevoked */
      );
      return { success: true, decodedClaims };
    } else {
      const err = new Error("No idToken found");
      return { success: false, err };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
};

/**
 * set the cookie on the header and redirect to the specified route
 *
 * @param {*} sessionCookie
 * @param {*} redirectTo
 * @returns
 */
const setCookieAndRedirect = async (
  request: Request,
  sessionCookie: string,
  redirectTo = "/"
) => {
  const session = await getSession(request.headers.get("cookie"));
  session.set("idToken", sessionCookie);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

/**
 * login the session by verifying the token, if all is good create/set cookie
 * and redirect to the appropriate route
 *
 * @param {*} idToken
 * @param {*} redirectTo
 * @returns
 */
export const sessionLogin = async (
  request: Request,
  idToken: string,
  redirectTo: string
) => {
  await getAuth().verifyIdToken(idToken);

  return getAuth()
    .createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000,
    })
    .then(
      sessionCookie => {
        // Set cookie policy for session cookie.
        return setCookieAndRedirect(request, sessionCookie, redirectTo);
      },
      error => {
        console.log(error);

        return {
          error: `sessionLogin error!: ${error.message}`,
        };
      }
    );
};

/**
 * revokes the session cookie from the firebase admin instance
 * @param {*} request
 * @returns
 */
export const sessionLogout = async (request: Request) => {
  const session = await getSession(request.headers.get("cookie"));

  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  return getAuth()
    .verifySessionCookie(session.get("idToken") ?? "", true /** checkRevoked */)
    .then(decodedClaims => {
      return getAuth().revokeRefreshTokens(decodedClaims?.sub);
    })
    .then(async () => {
      return redirect("/login", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    })
    .catch(error => {
      console.log(error);

      // Session cookie is unavailable or invalid. Force user to login.
      return { error: error?.message };
    });
};
