import express from "express";
import mainPagesRouter from "./routes/main_pages.js";
import presenterRouter from "./routes/presenter.js";
import participantRouter from "./routes/participant.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import db from "./database/db.js";

// establishing server
const app = express();
const server = app.listen(3000, () => {
  console.log("Server is listening on http://localhost:3000/");
});

// Initializing Socket.io
const io = new Server(server);

// Middlewares to parse the request bodies and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlware to track the previous url with session
app.use(
  session({ secret: "secret, babe", resave: false, saveUninitialized: false })
);

// Server the files under public as the static files
app.use(express.static("public"));

// Setting ejs as the template engine
app.set("view engine", "ejs");

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to parse cookie during handshake of establising socket.io connection
io.use((socket, next) => {
  let handshakeData = socket.request;
  cookieParser()(handshakeData, {}, () => {
    socket.cookies = handshakeData.cookies;
    next();
  });
});

// Extracting the every poll from database and set their status to inactivated state
let poll_status = {};
let sql = "SELECT url FROM user";
db.query(sql, (err, result) => {
  if (err) throw err;
  result.forEach((row) => {
    poll_status[row.url] = null;
  });
});

app.use("/", mainPagesRouter(poll_status));
app.use("/presenter", presenterRouter(io, poll_status));
app.use("/participant", participantRouter(io, poll_status));
