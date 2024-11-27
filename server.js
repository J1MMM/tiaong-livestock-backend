require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/connectDB");
const errorHandler = require("./middleware/errorHandler");
const corsOption = require("./config/corsOptions");
const { logger, logEvents } = require("./middleware/logEvents");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");

const PORT = process.env.PORT || 3500;
// connect to mongooDB
connectDB();
// custom middleware
app.use(credentials);
app.use(cors(corsOption));
app.use(logger);
// middleware for form data
app.use(express.urlencoded({ extended: false }));
// middleware for json data
app.use(express.json({ limit: "50mb" }));
// middleware for cookie
app.use(cookieParser());

//routes
app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/api/auth"));
app.use("/refresh", require("./routes/api/refresh"));
app.use("/logout", require("./routes/api/logout"));
app.use("/reset-password", require("./routes/api/resetPassword"));
app.use("/users", require("./routes/api/users"));
app.use("/approval", require("./routes/api/farmers/approval"));
app.use("/farmers", require("./routes/api/farmers/farmers"));
app.use("/announcement", require("./routes/api/farmers/announcement"));
app.use("/livestock", require("./routes/api/farmers/livestock"));

app.use("/api/farmers/refresh", require("./routes/api/farmers/refresh"));
app.use("/api/farmers/auth", require("./routes/api/farmers/auth"));
app.use("/api/farmers/signup", require("./routes/api/farmers/signup"));
app.use("/api/farmers/resend", require("./routes/api/farmers/resend"));
app.use("/api/farmers/verify-code", require("./routes/api/farmers/verifyCode"));
app.use("/api/farmers/livestock", require("./routes/api/farmers/livestock"));
app.use(
  "/api/farmers/announcement",
  require("./routes/api/farmers/announcement")
);
app.use("/api/farmers/analytics", require("./routes/api/farmers/livestock"));
app.use("/api/farmers/reset", require("./routes/api/farmers/reset"));

app.use(
  "/api/farmers/pending-account",
  require("./routes/api/farmers/pendingAccount")
);

// protected routes
app.use(verifyJWT);

// 404
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});
// error handlerr
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`🚀 server running on port ${PORT}`));
});
