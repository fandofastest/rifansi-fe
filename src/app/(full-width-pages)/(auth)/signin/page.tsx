import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Rifansi",
  description: "Sign in to access your Rifansi dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
