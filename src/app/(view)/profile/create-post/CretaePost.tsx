"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Image, Globe, Users, Lock } from "lucide-react";

export default function CreatePost() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [postType, setPostType] = useState("public");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          imageUrl,
          postType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear fields and close modal
        setContent("");
        setImageUrl("");
        setPostType("public");
        setIsOpen(false);
      } else {
        setError(data.error || "Something went wrong");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "friends":
        return <Users className="h-4 w-4" />;
      case "only_me":
        return <Lock className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <Button
          variant="outline"
          className="w-full h-auto py-3 px-4 justify-start text-gray-500 font-normal hover:text-gray-900 text-base"
          onClick={() => setIsOpen(true)}
        >
          What&apos;s on your mind?
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Post</DialogTitle>
            </DialogHeader>

            <form onSubmit={handlePostSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="What's on your mind?"
                  className="resize-none focus-visible:ring-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Image className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    Image URL (Optional)
                  </span>
                </div>
                <Input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getPostTypeIcon(postType)}
                  <span className="text-sm font-medium">Post Visibility</span>
                </div>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Friends
                      </div>
                    </SelectItem>
                    <SelectItem value="only_me">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Only Me
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
