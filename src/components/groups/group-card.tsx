import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Users, Lock, Unlock } from "lucide-react";
import { timeAgo, truncateText } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface GroupCardProps {
  group: {
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
  };
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-36 w-full bg-gradient-to-r from-primary/10 to-secondary/10 relative">
        {group.coverImage ? (
          <Image
            width={100}
            height={100}
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Users className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={group.isPrivate ? "secondary" : "outline"}>
            {group.isPrivate ? (
              <>
                <Lock className="h-3 w-3 mr-1" /> Private
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-1" /> Public
              </>
            )}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl truncate">{group.name}</CardTitle>
        </div>
        <CardDescription className="flex items-center text-xs">
          Created {timeAgo(group.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {group.description
            ? truncateText(group.description, 120)
            : "No description provided."}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={group.createdBy.profilePicture} />
            <AvatarFallback>
              {group.createdBy.firstName.charAt(0)}
              {group.createdBy.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs">
            <p className="font-medium">
              {group.createdBy.firstName} {group.createdBy.lastName}
            </p>
            <p className="text-muted-foreground">Creator</p>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href={`/groups/${group._id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
