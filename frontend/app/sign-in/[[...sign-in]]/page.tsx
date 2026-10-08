import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={<div>Loading...</div>}>
        <SignIn fallbackRedirectUrl="/home" />
      </Suspense>
    </div>
  );
}
