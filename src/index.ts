import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import https from "https";
import healthCheckRouter from "./routes/healthCheckRoute.js";
import taskRouter from "./routes/taskRoute.js";

const PORT = process.env.PORT ?? 3000;
const BASE_API_PATH = process.env.BASE_API_PATH ?? "/api/v1";

const app = express();

// Default Middlewares
app.use(cors());
app.use(helmet()); // Adding important headers to add a layer of security
app.use(compression()); // Compressing body to improve performance

// Cosuming Routes
app.use(BASE_API_PATH, healthCheckRouter);
app.use(BASE_API_PATH, taskRouter);

// Listening to My Server PORT
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});