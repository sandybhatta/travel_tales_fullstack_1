import express from "express"

import { protect } from "../middlewares/authMiddleware.js"
import createTrip from "../Controllers/trip.controllers/createTrip.js";
import {upload} from "../middlewares/multer.js"
import getTripById from "../Controllers/trip.controllers/getTripById.js";
import editTrip from "../Controllers/trip.controllers/editTrip.js";
import softDeleteTrip from "../Controllers/trip.controllers/softDeleteTrip.js";
import restoreTrip from "../Controllers/trip.controllers/restoreTrip.js";
import restoreAllTrip from "../Controllers/trip.controllers/restoreAllTrip.js";
import softDeleteAll from "../Controllers/trip.controllers/softDeleteAll.js";
import visibilityChange from "../Controllers/trip.controllers/visibilityChange.js";
import completeTrip from "../Controllers/trip.controllers/completeTrip.js";
import inviteToTrip from "../Controllers/trip.controllers/inviteToTrip.js";
import acceptToTrip from "../Controllers/trip.controllers/acceptToTrip.js";
import removeCollaborator from "../Controllers/trip.controllers/removeCollaborator.js";
import getCollaboratorsOfTrip from "../Controllers/trip.controllers/getCollaboratorsOfTrip.js";
import getinvitedsOfTrip from "../Controllers/trip.controllers/getInvitedsOfTrip.js";
import removeInvite from "../Controllers/trip.controllers/removeInvite.js";






const router = express.Router()



// *** 1 *** Core Trip Management (CRUD + Lifecycle) APIs



// to create a trip
router.post("/", protect,upload.single("coverPhoto") ,createTrip)


//to get the details about a trip

router.get("/:tripId", protect , getTripById)

// to edit trip info

router.patch("/:tripId", protect,upload.single("coverPhoto"), editTrip)


// to soft delete a trip

router.delete("/:tripId/archive",protect,softDeleteTrip)

// to soft delete all the trips
router.delete("/archive-all",protect, softDeleteAll)

// to restore a trip
router.patch("/:tripId/restore",protect, restoreTrip)

//to restore all the trips
router.patch("/restore-all",protect,restoreAllTrip)

//to change visibility of a trip
router.patch("/:tripId/visibility", protect, visibilityChange)

// to mark the trip as completed
router.patch("/:tripId/complete", protect, completeTrip )










// *** 2 *** Collaboration & Invitations


// invite a user to a trip
router.post("/:tripId/invite", protect, inviteToTrip)

// accept an invite to a trip
router.post("/:tripId/accept", protect, acceptToTrip)



// 1.get the list of accepted friends for a trip where the user is owner
router.get("/:tripId/collaborators",protect, getCollaboratorsOfTrip)


// 2.remove a collaborator from trip by the owner
router.delete("/:tripId/collaborators/:userId",protect, removeCollaborator)


// 3. get all the invited friends of a trip by the owner
router.get("/:tripId/invited", protect, getinvitedsOfTrip)



// 4. to delete a invited Friend to a trip by the owner
router.delete("/:tripId/invited/:userId", protect, removeInvite)























export default router;
