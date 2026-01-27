import http from "http";
import app from "../src/index";

import logger from "./utils/logger";
import { initSocket } from "./shared/services/socket";

const port = process.env.PORT || 3000;

const server = http.createServer(app);

initSocket(server);

server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
