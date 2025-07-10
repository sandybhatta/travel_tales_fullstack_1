import express from "express"

import { protect } from "../middlewares/authMiddleware.js"
import createTrip from "../Controllers/trip.controllers/createTrip.js";
import {upload} from "../middlewares/multer.js"
import getTripById from "../Controllers/trip.controllers/getTripById.js";
import editTrip from "../Controllers/trip.controllers/editTrip.js";






const router = express.Router()




// to create a trip
router.post("/", protect,upload.single("coverPhoto") ,createTrip)


//to get the details about a trip

router.get("/:tripId", protect , getTripById)

// to edit trip info

router.patch("/:tripId", protect,upload.single("coverPhoto"), editTrip)


















export default router;
