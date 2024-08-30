// app/routes/register.tsx

import { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { sessionLogin } from "~/fb.sessions.server";
import { auth } from "~/firebase-service";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { LoadingSpinner } from "~/components/loading-spinner";

export const links: LinksFunction = () => {
  return [];
};

// This will be the same as our Sign In but it will say Register and use createUser instead of signIn
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // const data = Object.fromEntries(formData);
  const email = formData.get("email" ?? "") as string;
  const password = formData.get("password" ?? "") as string;

  // perform a signout to clear any active sessions
  await auth.signOut();

  try {
    // setup user data
    await createUserWithEmailAndPassword(auth, email, password);

    const idToken = (await auth.currentUser?.getIdToken()) ?? "";

    return await sessionLogin(request, idToken, "/");
  } catch (error) {
    if (error instanceof Error) {
      return { error: { message: error?.message } };
    }
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  const isLoading = state === "loading";

  return (
    <div className="mx-auto mt-8 max-w-[400px] ">
      <Form id="register-form" method="post">
        <Card className="w-full max-w-md">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Register here to create a new user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <LoadingSpinner className="mr-2 size-4" />}
              Register
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Already{" "}
              <Link to="/login" className="font-medium underline">
                Registered?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Form>

      <div className="mt-2 flex flex-col items-center gap-2 text-sm text-red-600">
        {actionData?.error ? (actionData?.error as Error).message : null}
      </div>
    </div>
  );
}
