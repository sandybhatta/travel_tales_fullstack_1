
import User from "../models/User.js";

export const suggestions = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).select(
      "following followers closeFriends"
    );

    const following = currentUser.following.map((id) => id.toString());
    const followers = currentUser.followers.map((id) => id.toString());
    const closeFriends = currentUser.closeFriends.map((id) => id.toString());

    const secondDegree = new Map(); // userId => score

    const addSuggestionsFromList = async (userIds, weightFollow, weightClose) => {
      const users = await User.find({ _id: { $in: userIds } }).select(
        "following closeFriends"
      );

      users.forEach((user) => {
        user.following.forEach((followedId) => {
          const idStr = followedId.toString();
          if (idStr !== currentUserId.toString() && !following.includes(idStr)) 
          {
            secondDegree.set(idStr, (secondDegree.get(idStr) || 0) + weightFollow);
          }
        });

        user.closeFriends.forEach((friendId) => {
          const idStr = friendId.toString();
          if (idStr !== currentUserId.toString() && !following.includes(idStr)) {
            secondDegree.set(idStr, (secondDegree.get(idStr) || 0) + weightClose);
          }
        });
      });
    };

    // Add suggestions from followings, followers, and closeFriends
    await addSuggestionsFromList(following, 5, 8);
    await addSuggestionsFromList(followers, 3, 6);
    await addSuggestionsFromList(closeFriends, 7, 10);

    // Remove current user from suggestions
    secondDegree.delete(currentUserId.toString());

    // Convert map to sorted array
    const sortedSuggestions = [...secondDegree.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // limit to top 20

    const suggestedUserIds = sortedSuggestions.map(([userId]) => userId);

    const suggestedUsers = await User.find({ _id: { $in: suggestedUserIds } }).select(
      "_id name username avatar bio"
    );

    return res.status(200).json({ suggestions: suggestedUsers });
  } catch (err) {
    console.error("Suggestion API Error:", err);
    return res.status(500).json({ message: "Failed to fetch suggestions." });
  }
};



export default suggestions