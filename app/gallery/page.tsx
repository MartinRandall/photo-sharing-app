"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { remove } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import { useRouter } from "next/navigation";
import { PhotoUpload } from "@/components/photos/photo-upload";
import { PhotoCard } from "@/components/photos/photo-card";
import { Navbar } from "@/components/auth/navbar";

const client = generateClient<Schema>();

export default function GalleryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await loadPhotos();
    } catch (error) {
      router.push("/auth/signin");
    }
  };

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const { data } = await client.models.Photo.list();
      setPhotos(data.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      ));
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) return;

      // Delete from S3
      await remove({ path: photo.s3Key });

      // Delete from database
      await client.models.Photo.delete({ id: photoId });

      // Update UI
      setPhotos(photos.filter((p) => p.id !== photoId));
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo");
    }
  };

  return (
    <>
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Gallery</h1>
        
        <div className="mb-8 max-w-2xl">
          <PhotoUpload onUploadComplete={loadPhotos} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No photos yet. Upload your first photo above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
