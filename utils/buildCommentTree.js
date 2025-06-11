export const buildCommentTree = (comments) => {
    const commentMap = {};
    const roots = [];
  
    // Step 1: Prepare map
    comments.forEach(comment => {
      comment.replies = [];
      commentMap[comment._id.toString()] = comment;
    });
  
    // Step 2: Organize into tree
    comments.forEach(comment => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment.toString()];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });
  
    return roots;
  };
  