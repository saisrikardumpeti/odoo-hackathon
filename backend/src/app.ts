import express from 'express';
import cors from 'cors';
import { authConfig } from './config/auth';
import { ExpressAuth, getSession } from '@auth/express';
import { authenticatedUser } from './middleware/auth.middleware';


const app = express();
app.set('trust proxy', true)

app.use(cors());
app.use(express.json());
app.use("/auth/*", ExpressAuth(authConfig))

app.get("/", (_, res) => {
  return res.json({
    "status": "ok"
  })
})

app.get("/p",  authenticatedUser, async (req, res) => {
  // const user = await getSession(req, authConfig)
  // console.log(user)
  // console.log(req)
  return res.json({
    "status": "ok"
  })
})


export default app;