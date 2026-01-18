"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/auth/navbar";
import { Button } from "@/components/ui/button";
import { Camera, Upload, MessageCircle, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // User not logged in
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-center mb-6">
              <Camera className="h-16 w-16" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Share Your Photos with the World
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload, organize, and share your favorite memories. Connect with others through photos and comments.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              {user ? (
                <Link href="/gallery">
                  <Button size="lg">Go to Gallery</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button size="lg" variant="outline">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold">Easy Uploads</h3>
                <p className="text-muted-foreground">
                  Upload photos with descriptions in just a few clicks. Drag and drop support for seamless experience.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <MessageCircle className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold">Engage with Comments</h3>
                <p className="text-muted-foreground">
                  Share your thoughts and connect with others through photo comments and discussions.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <Shield className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your photos are stored securely with AWS. Only you can manage your uploads.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">Ready to Share Your Photos?</h2>
              <p className="text-lg text-muted-foreground">
                Join PhotoShare today and start building your photo gallery.
              </p>
              <Link href="/auth/signup">
                <Button size="lg">Create Account</Button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
