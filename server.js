require('dotenv').config();
const app = require("./app");
const http = require("http");

const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  switch (error.code) {
    case "EACCES":
      process.stdout.write(JSON.stringify(bind) + "requires elevated privileges" + "\n");
      process.exit(1);
      break;
    case "EADDRINUSE":
      process.stdout.write(JSON.stringify(bind) + "is already in use" + "\n");
      process.exit(1);
      break;
    default:
      throw error;
  }
};


const port = normalizePort(process.env.PORT);
app.set("port", port);
process.stdout.write("Port number " +JSON.stringify(port) +"\n");
const server = http.createServer(app);
server.on("error", onError);
server.listen(port);
process.stdout.write("Server started on port " +JSON.stringify(port) +"\n");