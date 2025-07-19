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
import upcomingTrips from "../Controllers/trip.controllers/upcomingTrips.js";
import onGoingTrips from "../Controllers/trip.controllers/onGoingTrips.js";
import pastTrips from "../Controllers/trip.controllers/pastTrips.js";
import addPostToTrip from "../Controllers/trip.controllers/addPostToTrip.js";
import getPostsOfTrip from "../Controllers/trip.controllers/getPostsOfTrip.js";
import deletePostOfTrip from "../Controllers/trip.controllers/deltePostOfTrip.js";
import highlightPost from "../Controllers/trip.controllers/highlightPost.js";
import toggleLike from "../Controllers/trip.controllers/toggleLikeTrip.js";
import getLikesOfTrip from "../Controllers/trip.controllers/getLikesOfTrip.js";
import addExpensesTrip from "../Controllers/trip.controllers/addExpensesTrip.js";
import getExpensesTrip from "../Controllers/trip.controllers/getExpensesTrip.js";
import deleteExpense from "../Controllers/trip.controllers/deleteExpense.js";
import addNote from "../Controllers/trip.controllers/addNote.js";
import getNotes from "../Controllers/trip.controllers/getNotes.js";
import deleteNote from "../Controllers/trip.controllers/deleteNote.js";
import pinUnpinNote from "../Controllers/trip.controllers/pinUnpinNote.js";
import addTodo from "../Controllers/trip.controllers/addTodo.js";
import getTodo from "../Controllers/trip.controllers/getTodo.js";
import toggleTodo from "../Controllers/trip.controllers/toggleTodo.js";
import deleteTodo from "../Controllers/trip.controllers/deleteTodo.js";






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

// to get all the upcoming trips

router.get("/status/upcoming",protect, upcomingTrips)

//to get all the ongoing trips
router.get("/status/ongoing", protect, onGoingTrips)

//to get the past trips
router.get("/status/past", protect, pastTrips)



// for adding posts in a trip
router.post("/:tripId/posts",protect, addPostToTrip)

//for getting all the post and related information of a trip( as i i have done for getting info for a trip id earlier +might build it later)

//🕒 router.get("/:tripId/posts",protect, getPostsOfTrip)




// for deleting a post from a trip

router.delete("/:tripId/posts/:postId", protect, deletePostOfTrip)



// for toggling  highlighting a post
router.patch("/:tripId/posts/:postId/highlight",protect, highlightPost)



// for toggle like a trip
router.post("/:tripId/like",protect, toggleLike)


// get users who liked the trip
router.get("/:tripId/likes",protect, getLikesOfTrip)





//7. Expense Management

// adding expenses to a trip
router.post("/:tripId/expenses",protect , addExpensesTrip)

// getting the list of expenses of a trip
router.get("/:tripId/expenses", protect , getExpensesTrip) 

router.delete(":tripId/expenses/:expenseId", protect, deleteExpense)



// 8.Notes System


// to add a note to a trip
router.post("/:tripId/notes", protect, addNote)


//to get all the post from a trip
router.get("/:tripId/notes", protect, getNotes)


// delete a note
router.delete("/:tripId/notes/:noteId/pin" , protect , deleteNote)




// pin unpin a note
router.patch("/:tripId/notes/:noteId/pin" , protect ,pinUnpinNote)











// 9. Todo List / Planning

// adding todo in a trip
router.post("/:tripId/todos" ,  protect, addTodo)

// list todo of trip
router.get("/:tripId/todos" , protect , getTodo)


// toggle task done
router.patch("/:tripId/todos/:todoId/toggle", protect , toggleTodo)


// deleting a todo from a trip
router.delete("/:tripId/todos/:todoId", protect , deleteTodo)

















export default router;
