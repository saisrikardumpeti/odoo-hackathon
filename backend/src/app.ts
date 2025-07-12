import express from 'express';
import cors from 'cors';
import { authConfig } from './config/auth';
import { ExpressAuth, getSession } from '@auth/express';
import router from './routes';


const app = express();
app.set('trust proxy', true)

app.use(cors());
app.use(express.json());
app.use("/api/auth/*", ExpressAuth(authConfig))
app.use("/api/", router)


export default app;