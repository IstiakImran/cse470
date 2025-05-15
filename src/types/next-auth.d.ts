import "next-auth";

declare module "next-auth" {
  interface User {
    id: string; // Prisma uses Int, but NextAuth expects string, so cast to string
    firstName?: string; // Reflects the firstName field from your Prisma model
    lastName?: string;
    contactNumber?: string;
    email?: string;
    isEmailVerified?: boolean; // Match the email verification field from your schema
    isAdmin?: boolean;
    isAlumni?: boolean;
    alumniVerificationStatus?:
      | "unverified"
      | "pending"
      | "verified"
      | "rejected";
  }

  interface Session {
    user: User & {
      id: string;
      firstName?: string;
      lastName?: string;
      contactNumber?: string;
      email?: string;
      isEmailVerified?: boolean;
      isAdmin?: boolean;
      isAlumni?: boolean;
      alumniVerificationStatus?: any;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // Corresponds to the Prisma User ID, cast to string
    firstName?: string; // Reflects the firstName field from your Prisma model
    lastName?: string;
    contactNumber?: string;
    email?: string;
    isEmailVerified?: boolean; // Email verification field
    isAdmin?: boolean;
    isAlumni?: boolean;
    alumniVerificationStatus?: string;
  }
}
