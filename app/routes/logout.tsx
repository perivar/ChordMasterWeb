// app/routes/logout.ts

import { LoaderFunctionArgs } from "@remix-run/node";
import { sessionLogout } from "~/fb.sessions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return await sessionLogout(request);
}
