import Fastify from "fastify";
import staticPlugin from "@fastify/static";
import { fileURLToPath } from "url";
import { createServer } from "http";
import path from "path";
import { BareServer } from "@tomphttp/bare-server-node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify();
const bareServer = new BareServer("/bare/");

// Serve Scramjet files
fastify.register(staticPlugin, {
  root: path.join(__dirname, "../node_modules/@mercuryworkshop/scramjet/dist"),
  prefix: "/scramjet/",
  decorateReply: false,
});

// Serve frontend
fastify.register(staticPlugin, {
  root: path.join(__dirname, "../public"),
  prefix: "/",
});

const server = createServer((req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    fastify.server.emit("request", req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

await fastify.ready();

server.listen(8080, () => {
  console.log("Running at http://localhost:8080");
});