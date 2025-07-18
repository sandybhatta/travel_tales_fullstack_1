import Trip from "../../models/trip.js";
import Post from "../../models/post.js";

const highlightPost = async (req, res) => {
  try {
    const { tripId, postId } = req.params;
    const { user } = req;

    const post = await Post.findById(postId);
    const trip = await Trip.findById(tripId);

    if (!post || !trip) {
      return res.status(404).json({ message: "Post or trip not found." });
    }

    // Check if user is allowed to highlight
    const isOwner = trip.isOwnedBy(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "You are not authorized to highlight a post in this trip." });
    }

    // Check if the post belongs to the trip
    const postObj = trip.posts.find(p => p.post.toString() === postId.toString());

    if (!postObj) {
      return res.status(400).json({ message: "This post does not belong to the trip." });
    }

    // Toggle highlight status
    const wasHighlighted = postObj.isHighlighted;

    postObj.isHighlighted = !wasHighlighted;
    postObj.highlightedBy = postObj.isHighlighted ? user._id : null;

    await trip.save();

    return res.status(200).json({
      message: postObj.isHighlighted ? "Post highlighted successfully." : "Post unhighlighted successfully.",
      postId: postId,
      highlighted: postObj.isHighlighted,
      highlightedBy: postObj.highlightedBy,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default highlightPost;
