import express from "express"

import { protect } from "../middlewares/authMiddleware.js"
import createTrip from "../Controllers/trip.controllers/createTrip.js";
import {upload} from "../middlewares/multer.js"






const router = express.Router()

router.post("/", protect,upload.single("coverPhoto") ,createTrip)


















export default router;
