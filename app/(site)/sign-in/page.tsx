import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="bg-white px-6 py-24" />}>
      <SignInForm />
    </Suspense>
  );
}
