"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Define interfaces based on the API response
interface Reporter {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Report {
  _id: string;
  reporterId: Reporter;
  targetType: "User" | "Post" | "Comment";
  targetId: string;
  reason: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "resolved" | "unresolved"
  >("all");
  const [selectedType, setSelectedType] = useState<
    "all" | "User" | "Post" | "Comment"
  >("all");

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string)
    : 1;

  useEffect(() => {
    fetchReports();
  }, [page, selectedFilter, selectedType]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/reports?page=${page}&limit=10`;

      if (selectedFilter !== "all") {
        url += `&status=${selectedFilter}`;
      }

      if (selectedType !== "all") {
        url += `&targetType=${selectedType}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (
    reportId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolved: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Update the reports state to reflect the change
      setReports((prevReports) =>
        prevReports.map((report) =>
          report._id === reportId
            ? { ...report, resolved: !currentStatus }
            : report
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Remove the deleted report from the state
      setReports((prevReports) =>
        prevReports.filter((report) => report._id !== reportId)
      );
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete report");
    }
  };

  const handleFilterChange = (filter: "all" | "resolved" | "unresolved") => {
    setSelectedFilter(filter);
    router.push("/admin/reports?page=1");
  };

  const handleTypeChange = (type: "all" | "User" | "Post" | "Comment") => {
    setSelectedType(type);
    router.push("/admin/reports?page=1");
  };

  const navigateToPage = (newPage: number) => {
    router.push(`/admin/reports?page=${newPage}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Reports Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="mb-4 sm:mb-0">
          <label className="block text-sm font-medium mb-2">
            Status Filter
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-3 py-1 rounded ${
                selectedFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange("resolved")}
              className={`px-3 py-1 rounded ${
                selectedFilter === "resolved"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => handleFilterChange("unresolved")}
              className={`px-3 py-1 rounded ${
                selectedFilter === "unresolved"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Unresolved
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Type Filter</label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleTypeChange("all")}
              className={`px-3 py-1 rounded ${
                selectedType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeChange("User")}
              className={`px-3 py-1 rounded ${
                selectedType === "User"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => handleTypeChange("Post")}
              className={`px-3 py-1 rounded ${
                selectedType === "Post"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => handleTypeChange("Comment")}
              className={`px-3 py-1 rounded ${
                selectedType === "Comment"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Comments
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loader"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600">No reports found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Reporter</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Reason</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      {report.reporterId.firstName} {report.reporterId.lastName}
                      <div className="text-sm text-gray-500">
                        {report.reporterId.email}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100">
                        {report.targetType}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs truncate">{report.reason}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          report.resolved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {report.resolved ? "Resolved" : "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/reports/${report._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                        <button
                          onClick={() =>
                            handleResolveReport(report._id, report.resolved)
                          }
                          className={`text-sm ${
                            report.resolved
                              ? "text-yellow-600"
                              : "text-green-600"
                          } hover:underline`}
                        >
                          {report.resolved
                            ? "Mark Unresolved"
                            : "Mark Resolved"}
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report._id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div>
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} reports
              </p>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => navigateToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded ${
                  pagination.page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => navigateToPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    pagination.page === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => navigateToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded ${
                  pagination.page === pagination.pages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
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
