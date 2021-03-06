import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import initializeDb from "./db";
import api from "./api";
import config from "./config.json";
import dotenv from "dotenv";

let app = express();
app.server = http.createServer(app);

app.set("json spaces", 4);

// logger
app.use(morgan("dev"));

// 3rd party middleware
app.use(
  cors({
    exposedHeaders: config.corsHeaders
  })
);

app.use(
  bodyParser.json({
    limit: config.bodyLimit
  })
);

// load dev ENV variables in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

initializeDb(db => {
  // api router
  app.use("/api", api(db));

  app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });
});

export default app;
