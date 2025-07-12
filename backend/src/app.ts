import express from 'express';
import cors from 'cors';


const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  return res.json({
    "status": "ok"
  })
})

export default app;