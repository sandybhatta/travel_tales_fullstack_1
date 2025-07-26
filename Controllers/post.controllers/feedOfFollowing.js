import Post from "../../models/post.js";

const feedOfFollowing = async (req, res) => {
  try {
    const { user } = req;
    const followingIds = user.following.map((userId) => userId.toString());

    const posts = await Post.find({
      author: { $in: followingIds },
    })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "author",
          select: "name username avatar closeFriends followers",
        },
        {
          path: "taggedUsers",
          select: "name username avatar",
        },
        {
          path: "likes",
          select: "_id",
        },
        {
          path: "comments",
          select: "_id",
        },
        {
          path: "tripId",
          populate: [
            {
              path: "user",
              select: "name username avatar followers closeFriends",
            },
            {
              path: "acceptedFriends.user",
              select: "name username avatar",
            },
          ],
        },
        {
          path: "sharedFrom",
          populate: [
            {
              path: "author",
              select: "name username avatar closeFriends followers",
            },
            {
              path: "taggedUsers",
              select: "name username avatar",
            },
            {
              path: "likes",
              select: "_id",
            },
            {
              path: "comments",
              select: "_id",
            },
            {
              path: "tripId",
              populate: [
                {
                  path: "user",
                  select: "name username avatar followers closeFriends",
                },
                {
                  path: "acceptedFriends.user",
                  select: "name username avatar",
                },
              ],
            },
          ],
        },
      ]);

    const postsToShow = posts.filter((post) => {
      // If post is part of a trip, use trip visibility
      if (post.tripId) {
        const trip = post.tripId;
        const visibility = trip.visibility;
        const tripOwner = trip.user;

        const followersSet = new Set(
          (tripOwner.followers || []).map((f) => f.toString())
        );
        const closeFriendsSet = new Set(
          (tripOwner.closeFriends || []).map((f) => f.toString())
        );

        if (visibility === "public") return true;
        if (visibility === "followers" && followersSet.has(user._id.toString()))
          return true;
        if (
          visibility === "close_friends" &&
          closeFriendsSet.has(user._id.toString())
        )
          return true;
        return false;
      }

      // Else use post visibility
      const visibility = post.visibility;
      const postAuthor = post.author;

      const followersSet = new Set(
        (postAuthor.followers || []).map((f) => f.toString())
      );
      const closeFriendsSet = new Set(
        (postAuthor.closeFriends || []).map((f) => f.toString())
      );

      if (visibility === "public") {
        if (
          post.sharedFrom &&
          post.sharedFrom.visibility &&
          post.sharedFrom.visibility !== "public"
        ) {
          return false;
        }

        
        if (post.sharedFrom?.tripId) {
          const sharedTrip = post.sharedFrom.tripId;
          const sharedTripOwner = sharedTrip.user;
          const sharedTripVisibility = sharedTrip.visibility;

          const sharedFollowersSet = new Set(
            (sharedTripOwner?.followers || []).map((f) => f.toString())
          );
          const sharedCloseFriendsSet = new Set(
            (sharedTripOwner?.closeFriends || []).map((f) => f.toString())
          );

          if (sharedTripVisibility === "public") return true;
          if (
            sharedTripVisibility === "followers" &&
            sharedFollowersSet.has(user._id.toString())
          )
            return true;
          if (
            sharedTripVisibility === "close_friends" &&
            sharedCloseFriendsSet.has(user._id.toString())
          )
            return true;
          return false;
        }

        return true;
      }

      if (visibility === "followers") {
        if (followersSet.has(user._id.toString())) return true;
      }

      if (visibility === "close_friends") {
        if (closeFriendsSet.has(user._id.toString())) return true;
      }

      return false;
    });

    return res.status(200).json({ posts: postsToShow });
  } catch (error) {
    console.error("Error in feedOfFollowing:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default feedOfFollowing;
