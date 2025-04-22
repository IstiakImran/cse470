import { CreateGroupForm } from "@/components/groups/create-group-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Group - CommunityHub",
  description: "Create a new community group",
};

export default function CreateGroupPage() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create a New Group</h1>
        <p className="text-muted-foreground mt-1">
          Start a community where people with similar interests can connect
        </p>
      </div>
      <CreateGroupForm />
    </div>
  );
}