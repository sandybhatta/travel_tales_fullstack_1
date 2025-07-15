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
import tripsOfUser from "../Controllers/trip.controllers/tripsOfUser.js";
import tripsCollaborated from "../Controllers/trip.controllers/tripsCollaborated.js";
import viewableTrip from "../Controllers/trip.controllers/virewableTrip.js";
import getPublicTrips from "../Controllers/trip.controllers/getPublicTrips.js";
import getTripsByTagname from "../Controllers/trip.controllers/getTripsByTag.js";
import discoverFeed from "../Controllers/trip.controllers/discoverFeed.js";
import getArchivedTrips from "../Controllers/trip.controllers/getArchivedTrips.js";






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

// get all the archived trips
router.get("/archived",protect,getArchivedTrips)
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





// *** trip discovery and filtering


// to see the trip list of a user where he is owner (useful for self or others)
router.get("/:userId/own-trip", protect, tripsOfUser)

// trips where user is the collaborator (useful for self or others)
router.get("/:userId/collaborated-trip", protect, tripsCollaborated)


//all viewable trips fo me
router.get("/visible", protect, viewableTrip)

// public explore feed for logged out users also
router.get("/public", getPublicTrips)

// get trips by tag
router.get("/tag/:tagname", protect, getTripsByTagname)

//feed api(not built fully + search)
router.get("/discover/feed",protect, discoverFeed)






//  Trip Timeline & Status

























export default router;
