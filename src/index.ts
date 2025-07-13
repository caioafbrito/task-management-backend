import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import https from "https";
import taskRouter from "./routes/taskRoute.js"

const PORT = process.env.PORT ?? 3000;
const BASE_URL = process.env.BASE_URL ?? "/api/v1";

const app = express();

app.use(cors());
app.use(helmet()); // Adding important headers to add a layer of security
app.use(compression()); // Compressing body to improve performance

app.use(BASE_URL, taskRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});