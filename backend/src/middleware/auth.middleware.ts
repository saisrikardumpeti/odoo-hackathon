import { getSession } from "@auth/express"
import { NextFunction, Request, Response } from "express"
import { authConfig } from "../config/auth"
import { db } from "../db"
import { users } from "../db/schema"
import { eq } from 'drizzle-orm'

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect
    }
  }
}
 
export async function authenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await getSession(req, authConfig)
  if (!session?.user) {
    res.redirect("/auth/signin")
  } else {
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email))
    req.user = user
    next()
  }
}