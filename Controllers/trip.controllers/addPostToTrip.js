import Trip from "../../models/trip.js";

const addPostToTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { postId, captionOverride, dayNumber, isHighlighted } = req.body;
    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({ error: "postId is required" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (!trip.canPost(req.user)) {
      return res.status(403).json({ message: "Not allowed to add post to this trip" });
    }

    const alreadyExists = trip.posts.some(p => p.post.toString() === postId);

    if (alreadyExists) {
      return res.status(400).json({ message: "Post already added to this trip" });
    }

    const postObj = {
      post: postId,
      addedBy: userId,
      captionOverride: captionOverride?.trim(),
      dayNumber: Number(dayNumber) || undefined,
      isHighlighted: !!isHighlighted,
      highlightedBy: isHighlighted ? userId : undefined,
    };

    trip.posts.push(postObj);

    await trip.save();

    return res.status(200).json({
      message: "Post added to trip successfully",
      trip,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export default addPostToTrip