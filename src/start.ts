import { Application, json } from "express";
import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import YAML from "yaml";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import * as cookieParser from "cookie-parser";
import errorHandler from "middlewares/error-handler.js";
import Routers from "./routes/index.js";
import passport from "passport";
import "./auth/passport.js";
import { fileURLToPath } from "url";
import { apiReference } from "@scalar/express-api-reference";

export function startApp(app: Application) {
  // === Path Definitions ===
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // === Server Definitions ===
  const PORT = process.env.PORT ?? 3000;
  const isProd = process.env.NODE_ENV === "production";

  // === Middlewares ===
  app.use(json());
  app.use(cors(), helmet(), cookieParser.default(), compression());

  const allowedOrigins = isProd
    ? ["'self'", "https://cdn.jsdelivr.net"] // add nonce here if possible
    : ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"];
  // Allow the CDN of Docs to inject script
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: allowedOrigins,
        styleSrc: allowedOrigins,
      },
    })
  );

  // === Pre-auth config ===
  app.use(passport.initialize());

  // === Routers ===
  app.use(Routers);

  // === Error Handling ===
  app.use(errorHandler);

  // === Documentation ===

  // Serve the OpenAPI spec as JSON dynamically
  const openApiYamlPath = path.join(__dirname, "..", "docs", "bundle.yaml");

  app.get("/openapi.json", (_, res) => {
    try {
      const yamlText = fs.readFileSync(openApiYamlPath, "utf8");
      const jsonSpec = YAML.parse(yamlText);
      res.json(jsonSpec);
    } catch (err) {
      console.error("Error reading OpenAPI YAML:", err);
      res.status(500).json({ error: "Failed to load API specification" });
    }
  });

  // Serve Scalar API reference docs
  app.use(
    "/reference",
    apiReference({
      theme: "fastify",
      url: "/openapi.json", // uses the route above
    })
  );

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
