import { Application, json } from "express";
import http from "http";
import https from "https";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import * as cookieParser from "cookie-parser";
import errorHandler from "middlewares/error-handler.js";
import Routers from "./routes/index.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import passport from "passport";
import "./auth/passport.js";

export function startApp(app: Application) {
  // === Path Definitions ===
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // === Server Definitions ===
  const PORT = process.env.PORT ?? 3000;
  const isProd = process.env.NODE_ENV === "prod";

  // === Middlewares ===
  app.use(json());
  app.use(cors(), helmet(), cookieParser.default(), compression());

  // === Pre-auth config ===
  app.use(passport.initialize());

  // === Routers ===
  app.use(Routers);

  // === Error Handling ===
  app.use(errorHandler);

  // === Documentation ===
  const openApiPath = path.join(__dirname, "..", "docs", "bundle.yaml");
  const docFile = fs.readFileSync(openApiPath, "utf8");
  const swaggerDocument = YAML.parse(docFile);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  let server;

  const isTest = process.env.NODE_ENV === "test";

  // === Choose HTTP for development, HTTPS for production ===
  if (isProd) {
    const sslKeyPath =
      process.env.SSL_KEY_PATH || path.resolve("certs/key.pem");
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

  // === Listen ===
  if (!isTest) {
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }

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

  return {
    app,
    server,
  };
}
