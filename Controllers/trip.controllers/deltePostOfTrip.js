import Trip from "../../models/trip.js";
import Post from "../../models/post.js";

const deletePostOfTrip = async (req, res) => {
  try {
    const { tripId, postId } = req.params;
    const { user } = req;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const isOwner = trip.isOwnedBy(user._id);

    const postToDelete = await Post.findById(postId);
    if (!postToDelete) {
      return res.status(404).json({ message: "No post found" });
    }

    const isPostOwner = postToDelete.author.toString() === user._id.toString();

    if (!isOwner && !isPostOwner) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this post from the trip." });
    }

    const isInTrip = trip.posts?.some((p) => p.post.toString() === postId.toString());
    if (!isInTrip) {
      return res
        .status(404)
        .json({ message: "This post is not part of the specified trip." });
    }

    // Remove post reference from trip
    trip.posts = trip.posts.filter((p) => p.post.toString() !== postId.toString());
    await trip.save();

    // Delete post from Post collection
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post removed successfully from the trip." });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default deletePostOfTrip;
