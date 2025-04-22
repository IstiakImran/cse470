"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { ImageIcon } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const createPostSchema = z.object({
  content: z.string().min(1, { message: "Post content is required" }),
  imageUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
});

interface CreatePostFormProps {
  groupId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export function CreatePostForm({ groupId, user }: CreatePostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImageField, setShowImageField] = useState(false);

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createPostSchema>) {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      // Reset form
      form.reset();
      setShowImageField(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback>
                  {user.firstName.charAt(0) + user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={`Share something with the group...`}
                          className="resize-none min-h-[100px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showImageField && (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem className="mt-3">
                        <FormControl>
                          <Input placeholder="Add an image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageField(!showImageField)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {showImageField ? "Remove Image" : "Add Image"}
                  </Button>
                  <Button type="submit" disabled={isLoading} size="sm">
                    {isLoading ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
