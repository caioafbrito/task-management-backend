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

// Format Middlewares
app.use(express.json());

// Global Middlewares
// cors() -> Enables Cross-Origin Resource Sharing to allow or restrict requests from different origins
// helmet() -> Adding important headers to add a layer of security
// compression() -> Compressing body to improve performance

app.use(cors(), helmet(), compression()); // Applying Globally

// Consuming API Routes
app.use(BASE_API_PATH, healthCheckRouter, taskRouter); // Applying to Specific Route

// Listening to My Server PORT
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});