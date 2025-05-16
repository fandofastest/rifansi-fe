import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Rifansi",
  description: "Create a new account to access Rifansi dashboard",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
