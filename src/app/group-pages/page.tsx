import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Globe, UserPlus, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="py-12 md:py-24 text-center">
        <div className="container space-y-6 md:space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Connect, Share, Engage
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Join communities that match your interests, share ideas, and engage with like-minded individuals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" asChild>
              <Link href="/groups">Explore Groups</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 w-full bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-8 text-center space-y-4 shadow-sm">
              <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Join Communities</h3>
              <p className="text-muted-foreground">
                Find and join groups that match your interests, hobbies, or professional goals
              </p>
            </div>
            <div className="bg-background rounded-lg p-8 text-center space-y-4 shadow-sm">
              <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Share Ideas</h3>
              <p className="text-muted-foreground">
                Post content, ask questions, and share resources with community members
              </p>
            </div>
            <div className="bg-background rounded-lg p-8 text-center space-y-4 shadow-sm">
              <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Engage & Connect</h3>
              <p className="text-muted-foreground">
                Comment, react, and build relationships with people who share your interests
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 w-full">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 mt-1">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Community Groups</h3>
                <p className="text-muted-foreground">
                  Create or join public and private groups centered around specific topics, interests, or goals.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 mt-1">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Rich Discussion</h3>
                <p className="text-muted-foreground">
                  Share posts with text and images, like content, and engage in threaded conversations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 mt-1">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Member Management</h3>
                <p className="text-muted-foreground">
                  Approve join requests for private groups and manage group membership easily.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2 mt-1">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Role-Based Permissions</h3>
                <p className="text-muted-foreground">
                  Assign different roles like admin and moderator to help manage larger communities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 w-full bg-primary text-primary-foreground">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-xl max-w-2xl mx-auto">
            Join our growing community of users and start connecting with like-minded individuals today.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}