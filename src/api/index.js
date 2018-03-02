import { version } from "../../package.json";
import { Router } from "express";
import point from "./point";

export default db => {
  let api = Router();

  // perhaps expose some API metadata at the root
  api.get("/", (req, res) => {
    res.json({ version });
  });

  api.use("/points", point(db));

  return api;
};
