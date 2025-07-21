import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import * as cookieParser from "cookie-parser";
import errorHandler from "middlewares/error-handler.js";
import Routers from "./routes/index.js";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";

// === Path Definitions ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Server Definitions ===
const PORT = process.env.PORT ?? 3000;
const isProd = process.env.NODE_ENV === "prod";
const app = express();

let server;

// === Choose HTTP for development, HTTPS for production ===
if (isProd) {
  const sslKeyPath = process.env.SSL_KEY_PATH || path.resolve("certs/key.pem");
  const sslCertPath =
    process.env.SSL_CERT_PATH || path.resolve("certs/cert.pem");
  const options = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath),
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

// === Middlewares ===
app.use(express.json());
app.use(cors(), helmet(), cookieParser.default(), compression());

// === Routers ===
app.use(Routers);

// === Error Handling ===
app.use(errorHandler);

// === Documentation ===
const openApiPath = path.join(__dirname, "..", "docs", "bundle.yaml");
const docFile = fs.readFileSync(openApiPath, "utf8");
const swaggerDocument = YAML.parse(docFile);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// === Listen ===
server.listen(PORT, () => {
  console.log(
    isProd
      ? `HTTPS server is listening on port ${PORT}`
      : `HTTP server is listening on port ${PORT}`
  );
});

// === Robust process error handling ===
process.on("unhandledRejection", (reason, promise) => {
  console.error({ promise, reason }, "Unhandled Rejection");
});

process.on("uncaughtException", (error) => {
  console.error({ error }, "Uncaught Exception");
  server.close(() => {
    process.exit(1);
  });
  setTimeout(() => process.exit(1), 10 * 1000).unref();
});
