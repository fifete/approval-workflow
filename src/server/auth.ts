import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";

import { env } from "~/env";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
interface JwtCallbackParams {
  token: any;
  user?: any;
  account?: any;
  profile?: any;
  isNewUser?: boolean;
}

interface SessionCallbackParams {
  session: any;
  user: any;
  token: any;
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user }: JwtCallbackParams) => {
      if (!!user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }: SessionCallbackParams) => {
      session.user = { id: token.id, ...session.user };

      return session;
    },
    async redirect({url, baseUrl}) {
      return baseUrl + "/home";
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "john" },
        password: { label: "Password", type: "password", placeholder: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            name: credentials.username,
            password: credentials.password,
          },
        })

        //TODO: ENCRYPT PASSWORD
        // if (!user || !(await compare(password, user.password))) {
        if (!user) {
          return null;
        }

        return user;
      }
    })
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
