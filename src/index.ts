import "dotenv/config";
import express from "express";
import https from "https";
const app = express();
const server = https.createServer(app);

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});