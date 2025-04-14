"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Send } from "lucide-react";
import Image from "next/image";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          imageUrl: imageUrl || undefined,
          postType: "public",
        }),
      });

      if (response.ok) {
        setContent("");
        setImageUrl("");
        onPostCreated();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        {imageUrl && (
          <div className="mt-4">
            <Image
              width={500}
              height={500}
              src={imageUrl}
              alt="Post preview"
              className="rounded-lg max-h-[300px] object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) setImageUrl(url);
          }}
        >
          <ImageIcon className="h-5 w-5 mr-2" />
          Add Image
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          size="sm"
        >
          <Send className="h-4 w-4 mr-2" />
          Post
        </Button>
      </CardFooter>
    </Card>
  );
}
