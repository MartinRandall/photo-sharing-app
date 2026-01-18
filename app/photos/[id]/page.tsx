"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { getUrl, remove } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import { Navbar } from "@/components/auth/navbar";
import { Comments } from "@/components/photos/comments";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

const client = generateClient<Schema>();

export default function PhotoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [photo, setPhoto] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    checkUser();
    loadPhoto();
  }, [photoId]);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      router.push("/auth/signin");
    }
  };

  const loadPhoto = async () => {
    setIsLoading(true);
    try {
      const { data } = await client.models.Photo.get({ id: photoId });
      
      if (!data) {
        router.push("/gallery");
        return;
      }

      setPhoto(data);

      // Load image URL
      const result = await getUrl({ path: data.s3Key });
      setImageUrl(result.url.toString());
    } catch (error) {
      console.error("Error loading photo:", error);
      router.push("/gallery");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    setIsDeleting(true);
    try {
      // Delete from S3
      await remove({ path: photo.s3Key });

      // Delete from database
      await client.models.Photo.delete({ id: photoId });

      router.push("/gallery");
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar user={user} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  if (!photo) {
    return null;
  }

  return (
    <>
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/gallery">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{photo.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {new Date(photo.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                {user?.userId === photo.userId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>

              {photo.description && (
                <p className="text-muted-foreground">{photo.description}</p>
              )}
            </div>

            <hr />

            <Comments photoId={photoId} />
          </div>
        </div>
      </div>
    </>
  );
}
