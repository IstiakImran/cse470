"use client";

import { useState } from "react";
// import { Dialog } from "@headlessui/react";

export default function CreatePost({
  onPostCreated,
}: {
  onPostCreated?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [postType, setPostType] = useState("public"); // default "public"
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
        // Clear fields, close modal
        setContent("");
        setImageUrl("");
        setPostType("public");
        setIsOpen(false);

        // Optional callback to refresh the feed
        if (onPostCreated) onPostCreated();
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
    <div className="bg-white p-4 shadow rounded">
      {/* "What's on your mind?" box */}
      <div
        className="p-2 border rounded cursor-pointer text-gray-600"
        onClick={() => setIsOpen(true)}
      >
        What&apos;s on your mind?
      </div>

      {/* Modal */}
      {/* <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-4">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Create Post
            </Dialog.Title>
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
                  placeholder="What's on your mind?"
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
                  Post Visibility
                </label>
                <select
                  id="postType"
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="only_me">Only Me</option>
                </select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog> */}
    </div>
  );
}
