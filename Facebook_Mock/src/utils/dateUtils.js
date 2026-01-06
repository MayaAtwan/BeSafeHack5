/**
 * Format Facebook ISO date to relative time (like Facebook)
 */
export function formatPostTime(isoString) {
  if (!isoString) return '';

  const now = new Date();
  const postDate = new Date(isoString);
  const diffMs = now - postDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'לפני רגע';
  } else if (diffMins < 60) {
    return `לפני ${diffMins} דקות`;
  } else if (diffHours < 24) {
    return `לפני ${diffHours} שעות`;
  } else if (diffDays < 7) {
    return `לפני ${diffDays} ימים`;
  } else {
    // Format as date
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return postDate.toLocaleDateString('he-IL', options);
  }
}
