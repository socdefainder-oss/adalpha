import { Router } from "express";
import { authRequired } from "../middlewares/auth";
import assetsRoutes from "./assets.routes";
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import eventsRoutes from "./events.routes";
import financeRoutes from "./finance.routes";
import groupsRoutes from "./groups.routes";
import helpRoutes from "./help.routes";
import kidsRoutes from "./kids.routes";
import mediaRoutes from "./media.routes";
import membersRoutes from "./members.routes";
import ministriesRoutes from "./ministries.routes";
import teachingRoutes from "./teaching.routes";

const router = Router();

router.get("/health", (_req, res) => {
  return res.json({ status: "ok", app: "app-igreja-api" });
});

router.use("/auth", authRoutes);
router.use("/members", authRequired, membersRoutes);
router.use("/ministries", authRequired, ministriesRoutes);
router.use("/groups", authRequired, groupsRoutes);
router.use("/kids", authRequired, kidsRoutes);
router.use("/teaching", authRequired, teachingRoutes);
router.use("/events", authRequired, eventsRoutes);
router.use("/finance", authRequired, financeRoutes);
router.use("/assets", authRequired, assetsRoutes);
router.use("/media", authRequired, mediaRoutes);
router.use("/help", authRequired, helpRoutes);
router.use("/dashboard", authRequired, dashboardRoutes);

export default router;
