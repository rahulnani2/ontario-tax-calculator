import { Router } from "express";
import { calculateTaxHandler, getTaxDataHandler } from "../controllers/taxController";

const router = Router();

router.post("/calculate", calculateTaxHandler);
router.get("/tax-data/:year", getTaxDataHandler);

export default router;