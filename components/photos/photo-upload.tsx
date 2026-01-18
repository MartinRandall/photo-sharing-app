"use client";

import { useState } from "react";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

const client = generateClient<Schema>();

export function PhotoUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      setFile(selectedFile);
      setError("");
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title) {
      setError("Please provide a file and title");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Upload to S3
      const s3Key = `photos/${Date.now()}-${file.name}`;
      await uploadData({
        path: s3Key,
        data: file,
        options: {
          contentType: file.type,
        },
      }).result;

      // Create database record
      await client.models.Photo.create({
        title,
        description: description || undefined,
        s3Key,
        uploadedAt: new Date().toISOString(),
        userId: "placeholder", // Will be automatically set by Amplify auth
      });

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setPreview("");
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium">
              Photo
            </label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {preview && (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded-md"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome photo"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this photo..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isUploading || !file} className="w-full">
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
