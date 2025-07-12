import GitHub from "@auth/express/providers/github";
import { env } from "./env";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import type { Provider } from "@auth/core/providers";
import { Account, Profile, User } from "@auth/express";
import { AdapterUser } from "@auth/core/adapters";

export type UserRole = 'guest' | 'user' | 'moderator';

export const authConfig = {
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }) as Provider,
  ],
  secret: env.AUTH_SECRET,
  callbacks: {
    async signIn(params: {
      user: User | AdapterUser;
      account?: Account | null;
      profile?: Profile;
      email?: { verificationRequest?: boolean };
      credentials?: Record<string, unknown>;
    }): Promise<boolean> {
      const { account, profile } = params;

      if (account?.provider === "github" && profile?.email) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, profile.email));

        if (!user) {
          await db.insert(users).values({
            email: profile.email,
            name: profile.name,
            role: 'user',
          });
        }
        return true;
      }
      return false;
    }
  }
};


declare module "@auth/express" {
  interface Session {
    user: {
      email: string;
      role: UserRole;
    };
  }
}