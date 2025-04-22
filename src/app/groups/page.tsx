import { GroupList } from "@/components/groups/group-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Groups - CommunityHub",
  description: "Discover and join community groups",
};

export default function GroupsPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Groups</h1>
          <p className="text-muted-foreground mt-1">
            Discover communities of like-minded individuals
          </p>
        </div>
        <Button asChild>
          <Link href="/groups/create">Create a Group</Link>
        </Button>
      </div>
      <GroupList />
    </div>
  );
}
