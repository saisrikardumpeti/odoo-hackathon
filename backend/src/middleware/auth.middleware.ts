import { getSession } from "@auth/express"
import { NextFunction, Request, Response } from "express"
import { authConfig } from "../config/auth"
 
export async function authenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = res.locals.session ?? (await getSession(req, authConfig))
  if (!session?.user) {
    res.redirect("/auth/signin")
  } else {
    next()
  }
}