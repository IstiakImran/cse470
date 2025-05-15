// components/AlumniVerificationStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Award } from "lucide-react";
import AlumniVerificationModal from "./AlumniVerificationModal";

interface VerificationStatus {
  status: "unverified" | "pending" | "verified" | "rejected";
  idNumber?: string;
  requestDate?: string;
}

export default function AlumniVerificationStatus() {
  const { data: session, update } = useSession();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const fetchVerificationStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/alumni-verification");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const handleVerificationSubmitted = () => {
    // Refetch status after submission
    fetchVerificationStatus();
    // Update the session to reflect pending status
    update();
  };

  // Show status badge based on verification status
  const renderStatusBadge = () => {
    if (!status) return null;

    switch (status.status) {
      case "verified":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Verified Alumni
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            Verification Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
          >
            <XCircle className="h-3.5 w-3.5" />
            Verification Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="h-8"></div>; // Placeholder height while loading
  }

  return (
    <div className="flex items-center gap-2">
      {renderStatusBadge()}

      {(status?.status === "unverified" || status?.status === "rejected") && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setOpenModal(true)}
        >
          <Award className="h-4 w-4" />
          {status?.status === "rejected"
            ? "Re-submit Verification"
            : "Verify Alumni Status"}
        </Button>
      )}

      <AlumniVerificationModal
        open={openModal}
        onOpenChange={setOpenModal}
        onVerificationSubmitted={handleVerificationSubmitted}
      />
    </div>
  );
}
