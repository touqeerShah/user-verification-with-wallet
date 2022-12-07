import express from "express";
import { createWeb3Message } from "../lib/auth";

const router = express.Router();
router.get("/get-message", createWeb3Message);

module.exports = router;
