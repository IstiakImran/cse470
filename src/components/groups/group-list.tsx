"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { GroupCard } from "@/components/groups/group-card";
import { Search } from "lucide-react";

interface Group {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  coverImage?: string;
  createdAt: string;
  members: string[];
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async (searchQuery: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = searchQuery
        ? `/api/groups?search=${encodeURIComponent(searchQuery)}`
        : "/api/groups";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data = await response.json();
      setGroups(data.groups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError("Failed to load groups. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroups(searchTerm);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-36 bg-muted animate-pulse rounded-t-lg" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded mt-4" />
                <div className="h-8 w-full bg-muted animate-pulse rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-destructive p-8">
          <p>{error}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold">No groups found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm
              ? `No groups match your search for "${searchTerm}"`
              : "There are no groups available. Create one to get started!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
