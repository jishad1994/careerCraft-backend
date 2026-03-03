import http from "http";
import app from "./app";

import logger from "./utils/logger";
import { socketServer } from "./dependencies/container.dependency";



const port = process.env.PORT || 3000;

const server = http.createServer(app);

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";

socketServer.connect(server, frontendUrl);

server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});

server.on("error", (error) => {
    logger.error(`Server error: ${error}`);
});
