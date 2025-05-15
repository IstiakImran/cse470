"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Post {
  _id: string;
  userId: User;
  content: string;
  imageUrl?: string;
  postType: "public" | "friends" | "only_me";
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  userId: User;
  postId: string;
  content: string;
  createdAt: string;
}

interface Report {
  _id: string;
  reporterId: User;
  targetType: "User" | "Post" | "Comment";
  targetId: string;
  postId?: string;
  commentId?: string;
  groupPostId?: string;
  reason: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PostDetailPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, fetch the report data using the report ID
      const reportResponse = await fetch(`/api/reports/${params.id}`);

      if (!reportResponse.ok) {
        if (reportResponse.status === 404) {
          throw new Error("Report not found");
        }
        throw new Error(
          `Error ${reportResponse.status}: ${reportResponse.statusText}`
        );
      }

      const reportData = await reportResponse.json();
      setReport(reportData);
      console.log(reportData);

      // Now fetch the associated post based on the report
      let postId: string | null = null;

      if (reportData.targetType === "Post") {
        postId = reportData.targetId;
      } else if (reportData.postId) {
        postId = reportData.postId;
      }

      if (postId) {
        const postResponse = await fetch(`/api/admin/posts/${postId}`);

        if (postResponse.ok) {
          const postData = await postResponse.json();
          setPost(postData);
        } else {
          console.error("Error fetching post:", postResponse.statusText);
        }
      }

      // If the report is for a comment, fetch the comment details
      if (reportData.targetType === "Comment" || reportData.commentId) {
        const commentId =
          reportData.targetType === "Comment"
            ? reportData.targetId
            : reportData.commentId;

        try {
          const commentResponse = await fetch(
            `/api/admin/comments/${commentId}`
          );
          if (commentResponse.ok) {
            const commentData = await commentResponse.json();
            setComment(commentData);
          }
        } catch (err) {
          console.error("Error fetching comment:", err);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async () => {
    if (!report) return;

    if (!confirm("Are you sure you want to mark this report as resolved?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${report._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolved: true }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Update local state
      setReport((prev) => (prev ? { ...prev, resolved: true } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve report");
    }
  };

  const handleRemoveContent = async () => {
    if (!report) return;

    const confirmMessage =
      report.targetType === "Post"
        ? "Are you sure you want to remove this post?"
        : report.targetType === "Comment"
        ? "Are you sure you want to remove this comment?"
        : "Are you sure you want to remove this content?";

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      let endpoint = "";

      if (report.targetType === "Post") {
        endpoint = `/api/admin/posts/${report.targetId}`;
      } else if (report.targetType === "Comment") {
        endpoint = `/api/admin/comments/${report.targetId}`;
      } else {
        throw new Error("Cannot remove this type of content");
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Mark report as resolved
      await fetch(`/api/reports/${report._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolved: true }),
      });

      // Redirect back to reports list
      router.push("/admin/reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove content");
    }
  };

  const handleSendNotifications = async () => {
    if (!report) return;

    try {
      // Create notification for reporter
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: report.reporterId._id,
          type: "report_actioned",
          message:
            "Thank you for your report. The content has been reviewed and action has been taken.",
        }),
      });

      // Create notification for content owner if applicable
      if (report.targetType === "Post" && post) {
        await fetch("/api/admin/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: post.userId._id,
            type: "content_reported",
            message: `Your ${report.targetType.toLowerCase()} has been reported and reviewed.`,
          }),
        });
      } else if (report.targetType === "Comment" && comment) {
        await fetch("/api/admin/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: comment.userId._id,
            type: "content_reported",
            message: `Your ${report.targetType.toLowerCase()} has been reported and reviewed.`,
          }),
        });
      }

      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send notifications"
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/admin/reports" className="text-blue-600 hover:underline">
          ← Back to Reports
        </Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Report not found
        </div>
        <Link href="/admin/reports" className="text-blue-600 hover:underline">
          ← Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/reports" className="text-blue-600 hover:underline">
          ← Back to Reports
        </Link>
        <div className="flex space-x-2">
          <button
            onClick={handleSendNotifications}
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
            disabled={notificationSent}
          >
            {notificationSent ? "Notifications Sent" : "Send Notifications"}
          </button>
          {!report.resolved && (
            <button
              onClick={handleResolveReport}
              className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
            >
              Mark as Resolved
            </button>
          )}
          {(report.targetType === "Post" || report.targetType === "Comment") &&
            !report.resolved && (
              <button
                onClick={handleRemoveContent}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Remove {report.targetType}
              </button>
            )}
        </div>
      </div>

      {notificationSent && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Notifications sent successfully!
        </div>
      )}

      {/* Report Information */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Report Information</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Reporter Details</h3>
              <p className="mb-2">
                <span className="font-medium">Name:</span>{" "}
                {report?.reporterId?.firstName} {report?.reporterId?.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {report?.reporterId?.email}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Report Details</h3>
              <p className="mb-2">
                <span className="font-medium">Target Type:</span>{" "}
                {report.targetType}
              </p>
              <p className="mb-2">
                <span className="font-medium">Target ID:</span>{" "}
                {report.targetId}
              </p>
              {report.postId && (
                <p className="mb-2">
                  <span className="font-medium">Post ID:</span> {report.postId}
                </p>
              )}
              {report.commentId && (
                <p className="mb-2">
                  <span className="font-medium">Comment ID:</span>{" "}
                  {report.commentId}
                </p>
              )}
              {report.groupPostId && (
                <p className="mb-2">
                  <span className="font-medium">Group Post ID:</span>{" "}
                  {report.groupPostId}
                </p>
              )}
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  report.resolved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {report.resolved ? "Resolved" : "Pending"}
              </span>
              <p className="mt-2">
                <span className="font-medium">Reported on:</span>{" "}
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Report Reason</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{report.reason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reported Comment */}
      {comment && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Reported Comment</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Comment Author</h3>
                <p className="mb-2">
                  <span className="font-medium">Name:</span>{" "}
                  {comment.userId.firstName} {comment.userId.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {comment.userId.email}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Comment Details</h3>
                <p className="mb-2">
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Comment Content</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Details */}
      {post && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold">Post Details</h1>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Post Author</h2>
                <p className="mb-2">
                  <span className="font-medium">Name:</span>{" "}
                  {post.userId.firstName} {post.userId.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {post.userId.email}
                </p>
                <p className="mt-4">
                  <Link
                    href={`/admin/users/${post.userId._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View User Profile
                  </Link>
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Post Information</h2>
                <p className="mb-2">
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(post.createdAt).toLocaleString()}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Updated:</span>{" "}
                  {new Date(post.updatedAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Visibility:</span>{" "}
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">
                    {post.postType.replace("_", " ")}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Post Content</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>

            {post.imageUrl && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">Post Image</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Image
                    width={500}
                    height={500}
                    src={post.imageUrl}
                    alt="Post image"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .loader {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
