// app/routes/forgot.tsx

import { ActionFunctionArgs, LinksFunction, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { auth } from "~/firebase-service";
import { sendPasswordResetEmail } from "firebase/auth";

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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const email = formData.get("email" ?? "") as string;

  // perform firebase send password reset email
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (error instanceof Error) {
      return { error: { message: error?.message } };
    }
  }

  // success, send user to /login page
  return redirect("/login");
}

export default function ForgottenPassword() {
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation();
  const isLoading = state === "loading";

  return (
    <div className="mx-auto mt-8 max-w-[400px] ">
      <Form id="forgotten-form" method="post">
        <Card className="w-full max-w-md">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">
              Forgotten Password?
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Enter your email address to reset the password
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <LoadingSpinner className="mr-2 size-4" />}
              Request Password Reset Link
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Not Yet{" "}
              <Link to="/register" className="font-medium underline">
                Registered?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Form>

      <div className="mt-5 flex flex-col items-center gap-2 text-sm text-red-600">
        {actionData?.error ? (actionData?.error as Error).message : null}
      </div>
    </div>
  );
}
