import React from 'react';
import './UserAvatar.css';

function UserAvatar({ name }) {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div className="user-avatar" title={name}>
      {initials}
    </div>
  );
}

export default UserAvatar;
