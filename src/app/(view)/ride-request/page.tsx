"use client";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the RideRequestForm component with SSR disabled
const RideRequestForm = dynamic(
  () => import("@/components/ride-request/RideRequestForm"),
  {
    ssr: false,
  }
);

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Component only mounts when on the client
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render nothing during SSR
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <RideRequestForm />
    </div>
  );
}
