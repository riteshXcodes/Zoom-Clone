import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={<div>Loading...</div>}>
        <SignUp fallbackRedirectUrl="/home" />
      </Suspense>
    </div>
  );
}
