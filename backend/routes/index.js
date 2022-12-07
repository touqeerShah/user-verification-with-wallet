import express from "express";
import { createWeb3Message, verify } from "../lib/auth";

const router = express.Router();
router.get("/get-message", createWeb3Message);
router.post("/verify-signature", verify);

module.exports = router;
