import { Router } from "express";
import {
  createAlert,
  getAlerts,
  deleteAlert,
  resetAlert,
} from "../controllers/alertController";
import { validate } from "../middleware/validate";
import { alertLimiter } from "../middleware/rateLimiter";
import { createAlertSchema } from "../schemas/alertSchema";

const router = Router();

router.get("/", alertLimiter, getAlerts);
router.post("/", alertLimiter, validate(createAlertSchema), createAlert);
router.delete("/:id", alertLimiter, deleteAlert);
router.patch("/:id/reset", alertLimiter, resetAlert);

export default router;