import Link from "next/link";

export default function SignInButton() {
  return (
    <Link href="/auth/signin" className="hover:text-[#FF5C38] transition-colors">
      SIGN IN
    </Link>
  );
}
