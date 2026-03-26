import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      subscriptionTier: string;
    };
  }

  interface User {
    subscriptionTier?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    subscriptionTier?: string;
  }
}
