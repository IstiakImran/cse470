// components/CreatePost.tsx
"use client";
import { useState } from "react";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [postType, setPostType] = useState("");
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
        alert("Post created successfully");
        setContent("");
        setImageUrl("");
        setPostType("");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <form onSubmit={handlePostSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Write something..."
            required
          />
        </div>

        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Image URL (Optional)
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter image URL"
          />
        </div>

        <div>
          <label
            htmlFor="postType"
            className="block text-sm font-medium text-gray-700"
          >
            Post Type
          </label>
          <input
            type="text"
            id="postType"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter post type"
            required
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? "Posting..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}
