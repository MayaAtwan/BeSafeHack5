/**
 * Utility to check if a post is legitimate or not
 * Returns an array/map of post IDs and their legitimacy status
 */

// Array of post IDs that are NOT legit (fake/misleading posts)
const NOT_LEGIT_POST_IDS = [
  '2015_9015', 
  '2011_9011',
  '2018_9018',
  '2012_9012',
];

/**
 * Checks if a post is legitimate
 * @param {string} postId - The ID of the post to check
 * @returns {boolean} - true if post is legit, false if not
 */
export function isPostLegit(postId) {
  return !NOT_LEGIT_POST_IDS.includes(postId);
}

/**
 * Gets the legitimacy status for multiple posts
 * @param {Array} posts - Array of post objects with id property
 * @returns {Object} - Map of postId -> boolean (true if legit)
 */
export function getPostsLegitimacyMap(posts) {
  const map = {};
  posts.forEach(post => {
    if (post && post.id) {
      map[post.id] = isPostLegit(post.id);
    }
  });
  return map;
}

