"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface VerificationRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  alumniIdNumber: string;
  alumniCertificateLink: string;
  alumniVerificationStatus: "pending" | "rejected";
  alumniVerificationRequestDate: string;
  alumniVerificationNotes?: string;
}

export default function AdminVerificationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //   useEffect(() => {
  //     // Redirect if not admin
  //     if (session && !(session.user as any).isAdmin) {
  //       router.push("/");
  //       return;
  //     }

  //     fetchRequests();
  //   }, [session, router]);
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/alumni-verification");
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setRequests(data.requests);
      } else {
        throw new Error(data.error || "Failed to fetch verification requests");
      }
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/alumni-verification");
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          setRequests(data.requests);
        } else {
          throw new Error(
            data.error || "Failed to fetch verification requests"
          );
        }
      } catch (error) {
        console.error("Error fetching verification requests:", error);
        toast.error("Failed to load verification requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [session, router]);

  const handleAction = async () => {
    if (!selectedRequest || !action) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/alumni-verification", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedRequest._id,
          status: action === "approve" ? "verified" : "rejected",
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update verification status");
      }

      toast.success(
        `Verification request ${
          action === "approve" ? "approved" : "rejected"
        }.`
      );

      // Refresh the requests
      await fetchRequests();
      setOpenDialog(false);
      setNotes("");
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openActionDialog = (
    request: VerificationRequest,
    actionType: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setAction(actionType);
    setNotes(request.alumniVerificationNotes || "");
    setOpenDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-8 w-full mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Alumni Verification Requests</CardTitle>
          <CardDescription>
            Review and manage alumni verification requests from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No pending verification requests
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      {request.firstName} {request.lastName}
                    </TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.alumniIdNumber}</TableCell>
                    <TableCell>
                      {request.alumniVerificationStatus === "pending" ? (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 w-fit"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 w-fit"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(request.alumniVerificationRequestDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(request.alumniCertificateLink, "_blank")
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Certificate
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openActionDialog(request, "approve")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => openActionDialog(request, "reject")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve"
                ? "Approve Verification"
                : "Reject Verification"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "Are you sure you want to approve this alumni verification request?"
                : "Please provide a reason for rejecting this verification request."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Request Details:</p>
                <p className="text-sm">
                  <span className="font-medium">Name:</span>{" "}
                  {selectedRequest.firstName} {selectedRequest.lastName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span>{" "}
                  {selectedRequest.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">ID Number:</span>{" "}
                  {selectedRequest.alumniIdNumber}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Admin Notes:</p>
              <Textarea
                placeholder="Add notes about this verification (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : action === "approve" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
