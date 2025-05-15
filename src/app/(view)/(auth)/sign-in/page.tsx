"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Mail, Lock, ArrowRight, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner"; // Added toast import

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      // Check if this is the first time login
      const isFirstTimeLogin = localStorage.getItem("isFirstTimeLogin");

      // If no record exists or it's explicitly set to true, it's a first time login
      if (!isFirstTimeLogin || isFirstTimeLogin === "true") {
        // Set the flag to false for future logins
        localStorage.setItem("isFirstTimeLogin", "false");

        // Show toast notification
        toast.success("Welcome! Please complete your profile to get started.");

        // Redirect to edit profile page
        router.push("/profile/edit");
      } else {
        // For returning users, go to the feed
        router.push("/feed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {[...Array(5)].map((_, i) => (
        <MessageSquare
          key={i}
          className="text-blue-300 opacity-20 absolute animate-float"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            fontSize: `${Math.random() * 40 + 20}px`,
          }}
        />
      ))}

      <div className="p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Users className="text-blue-600 w-12 h-12" />
          <h2 className="text-3xl font-bold text-gray-800 ml-2">Connect</h2>
        </div>
        <h3 className="text-xl font-semibold text-center mb-6 text-gray-700">
          Welcome back to Connect
        </h3>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700"
            >
              Email or Username
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                required
                className="pl-10 block w-full"
                placeholder="you@example.com or @username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10 block w-full"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
        <div className="mt-4 flex justify-between items-center">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Forgot Password?
          </Link>
        </div>
        <p className="mt-4 text-left text-sm text-gray-600">
          New to Connect?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Create an account and start connecting
          </Link>
        </p>
        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-xs text-center text-gray-500">
            `&quot;Join millions of people sharing ideas, experiences, and
            moments that make life meaningful.`&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
