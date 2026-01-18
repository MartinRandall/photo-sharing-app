"use client";

import { signOut } from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export function Navbar({ user }: { user?: any }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Camera className="h-6 w-6" />
          PhotoShare
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/gallery">
                <Button variant="ghost">Gallery</Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user.signInDetails?.loginId}</span>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
