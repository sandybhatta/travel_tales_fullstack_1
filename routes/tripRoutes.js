import express from "express"
import { protect } from "../middlewares/authMiddleware.js"
import { upload } from "../middlewares/multer.js"

import createTrip from "../Controllers/trip.controllers/createTrip.js";
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

//import getPostsOfTrip from "../Controllers/trip.controllers/getPostsOfTrip.js";


const router = express.Router();


// ✅ STATIC / SPECIFIC ROUTES FIRST

router.get("/status/upcoming", protect, upcomingTrips);
router.get("/status/ongoing", protect, onGoingTrips);
router.get("/status/past", protect, pastTrips);

router.get("/archived", protect, getArchivedTrips);
router.delete("/archive-all", protect, softDeleteAll);
router.patch("/restore-all", protect, restoreAllTrip);

router.get("/visible", protect, viewableTrip);
router.get("/public", getPublicTrips);
router.get("/discover/feed", protect, discoverFeed);
router.get("/tag/:tagname", protect, getTripsByTagname);

router.get("/:userId/own-trip", protect, tripsOfUser);
router.get("/:userId/collaborated-trip", protect, tripsCollaborated);


// ✅ CREATE TRIP
router.post("/", protect, upload.single("coverPhoto"), createTrip);


// ✅ COLLABORATION & INVITATIONS
router.post("/:tripId/invite", protect, inviteToTrip);
router.post("/:tripId/accept", protect, acceptToTrip);
router.get("/:tripId/collaborators", protect, getCollaboratorsOfTrip);
router.delete("/:tripId/collaborators/:userId", protect, removeCollaborator);
router.get("/:tripId/invited", protect, getinvitedsOfTrip);
router.delete("/:tripId/invited/:userId", protect, removeInvite);


// ✅ POSTS
router.post("/:tripId/posts", protect, addPostToTrip);
router.delete("/:tripId/posts/:postId", protect, deletePostOfTrip);
router.patch("/:tripId/posts/:postId/highlight", protect, highlightPost);


// ✅ LIKES
router.post("/:tripId/like", protect, toggleLike);
router.get("/:tripId/likes", protect, getLikesOfTrip);


// ✅ EXPENSES
router.post("/:tripId/expenses", protect, addExpensesTrip);
router.get("/:tripId/expenses", protect, getExpensesTrip);
router.delete("/:tripId/expenses/:expenseId", protect, deleteExpense);


// ✅ NOTES
router.post("/:tripId/notes", protect, addNote);
router.get("/:tripId/notes", protect, getNotes);
router.delete("/:tripId/notes/:noteId", protect, deleteNote);
router.patch("/:tripId/notes/:noteId/pin", protect, pinUnpinNote);


// ✅ TODOs
router.post("/:tripId/todos", protect, addTodo);
router.get("/:tripId/todos", protect, getTodo);
router.patch("/:tripId/todos/:todoId/toggle", protect, toggleTodo);
router.delete("/:tripId/todos/:todoId", protect, deleteTodo);


// ✅ TRIP LIFE-CYCLE
router.patch("/:tripId", protect, upload.single("coverPhoto"), editTrip);
router.patch("/:tripId/restore", protect, restoreTrip);
router.delete("/:tripId/archive", protect, softDeleteTrip);
router.patch("/:tripId/visibility", protect, visibilityChange);
router.patch("/:tripId/complete", protect, completeTrip);


// ✅ LAST: Dynamic route for fetching trip by ID
router.get("/:tripId", protect, getTripById);


export default router;
