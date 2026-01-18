"use client";

import { useState, useEffect } from "react";
import { getUrl } from "aws-amplify/storage";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PhotoCardProps {
  photo: {
    id: string;
    title: string;
    description?: string;
    s3Key: string;
    uploadedAt: string;
  };
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export function PhotoCard({ photo, onDelete, showDelete = true }: PhotoCardProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const result = await getUrl({
          path: photo.s3Key,
        });
        setImageUrl(result.url.toString());
      } catch (error) {
        console.error("Error loading image:", error);
      }
    };

    loadImage();
  }, [photo.s3Key]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onDelete) return;
    
    if (confirm("Are you sure you want to delete this photo?")) {
      setIsDeleting(true);
      await onDelete(photo.id);
    }
  };

  return (
    <Link href={`/photos/${photo.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-square relative bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={photo.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{photo.title}</h3>
          {photo.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {photo.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(photo.uploadedAt).toLocaleDateString()}
          </p>
        </CardContent>
        {showDelete && onDelete && (
          <CardFooter className="p-4 pt-0">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
