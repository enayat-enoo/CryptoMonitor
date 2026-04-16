import { Request, Response } from "express";
import Alert from "../models/alertModel";

// POST /api/alerts
export const createAlert = async (req: Request, res: Response) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: "Failed to create alert" });
  }
};

// GET /api/alerts
export const getAlerts = async (_req: Request, res: Response) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

// DELETE /api/alerts/:id
export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      res.status(404).json({ error: "Alert not found" });
      return;
    }
    res.json({ message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete alert" });
  }
};

// PATCH /api/alerts/:id/reset
export const resetAlert = async (req: Request, res: Response) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { triggered: false },
      { new: true },
    );
    if (!alert) {
      res.status(404).json({ error: "Alert not found" });
      return;
    }
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: "Failed to reset alert" });
  }
};
