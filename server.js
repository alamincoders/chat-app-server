const auth = require("json-server-auth");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
const data = require("./db.js");
const jsonServer = require("json-server");
const middleware = jsonServer.defaults();
const router = jsonServer.router(data);
const port = process.env.PORT || 9000;
global.io = io;

/* server.use(middleware);
server.use(router); */

// response middleware
router.render = (req, res) => {
  const path = req.path;
  const method = req.method;

  if (path.includes("/conversations") && (method === "POST" || method === "PATCH")) {
    // emit socket event
    io.emit("conversation", {
      data: res.locals.data,
    });
  } else if (path.includes("/messages") && method === "POST") {
    io.emit("messages", {
      data: res.locals.data,
    });
  }

  res.json(res.locals.data);
};

// Bind the router db to the app
app.db = router.db;

app.use(middleware);

const rules = auth.rewriter({
  users: 640,
  conversations: 660,
  messages: 660,
});

app.use(rules);
app.use(auth);
app.use(router);

server.listen(port, () => {
  console.log("listening on port " + port);
});
