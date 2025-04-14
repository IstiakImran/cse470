"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signupSchema } from "@/schemas/signupSchema";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { toast } from "sonner";

/** 1) Updated the interface to match the schema fields: firstName, lastName, contactNumber. */
interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
}

export default function Signup() {
  /** 2) Updated initial state to include firstName, lastName, and contactNumber. */
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    contactNumber: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure the user has accepted terms and conditions
    if (!acceptTerms) {
      toast(
        "You must accept our terms and privacy policy before creating an account."
      );
      return;
    }

    // Validate form data using the Zod schema
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      toast.error("Please check your information and try again.");
      return;
    }

    try {
      const response = await axios.post("/api/sign-up", formData);
      const res = response.data;
      if (res.success) {
        toast.success("Your account has been created successfully.");
        router.replace(`/verify/${res.userId}`);
      }
    } catch (error) {
      toast.error(
        "An error occurred while creating your account. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-blue-600">
            Join Connect
          </CardTitle>
          <CardDescription className="text-center">
            Create your account and start connecting with amazing people
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* 3) Updated form fields to match firstName, lastName, email, password, contactNumber */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row with firstName and lastName */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="(+1) 555-1234"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptedTerms"
                checked={acceptTerms}
                onCheckedChange={(checked) =>
                  setAcceptTerms(checked as boolean)
                }
              />
              <Label htmlFor="acceptedTerms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  terms of service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  privacy policy
                </Link>
              </Label>
            </div>
          </form>
        </CardContent>

        {/* 4) Submit button and link to sign in */}
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Create Account
          </Button>
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
