// components/AlumniVerificationModal.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define the form schema
const formSchema = z.object({
  alumniIdNumber: z.string().min(1, "ID number is required"),
  alumniCertificateLink: z.string().url("Please enter a valid URL"),
});

type AlumniVerificationFormValues = z.infer<typeof formSchema>;

interface AlumniVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationSubmitted: () => void;
}

export default function AlumniVerificationModal({
  open,
  onOpenChange,
  onVerificationSubmitted,
}: AlumniVerificationModalProps) {
  const { data: session, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AlumniVerificationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alumniIdNumber: "",
      alumniCertificateLink: "",
    },
  });

  const onSubmit = async (values: AlumniVerificationFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/alumni-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit verification request");
      }

      toast.success(
        "Your alumni verification request has been submitted for review."
      );

      // Update session to reflect pending status
      await update();

      onVerificationSubmitted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting alumni verification:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit verification request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alumni Verification Request</DialogTitle>
          <DialogDescription>
            Please provide your student ID number and a link to your graduation
            certificate to verify your alumni status.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="alumniIdNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student/Alumni ID Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your ID number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your official student identification number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alumniCertificateLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Graduation Certificate</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to your graduation certificate (Google Drive, Dropbox,
                    etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit for Verification
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
