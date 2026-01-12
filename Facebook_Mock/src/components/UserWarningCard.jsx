import React from "react";

export default function UserWarningCard({username}) {
  if (!username) return null;

  return (
    <section style={styles.card}>
      <header style={styles.header}>
        <span style={styles.icon}>⚠️</span>
        <h3 style={styles.title}>Content Safety Notice</h3>
      </header>

      <div style={styles.userRow}>
        <div style={styles.avatar}>
          {username.charAt(0).toUpperCase()}
        </div>

        <div>
          <div style={styles.username}>{username}</div>
          <div style={styles.meta}>
            Frequently appears in harmful content categories
          </div>
        </div>
      </div>

      <p style={styles.description}>
        Based on recent activity, this account is often associated with
        negative or harmful content. Repeated exposure to this content
        may affect your feed experience.
      </p>
    </section>
  );
}

const styles = {
  card: {
    width: "100%",
    padding: "16px",
    borderRadius: 16,
    background:
      "linear-gradient(135deg, rgba(255, 193, 7, 0.12), rgba(255, 255, 255, 0.95))",
    border: "1px solid rgba(255, 193, 7, 0.35)",
    boxShadow: "0 10px 26px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 30,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  icon: {
    fontSize: 18,
    lineHeight: 1,
  },

  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    color: "#2b2b2b",
    textAlign: "center",
  },

userRow: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 12,
  borderRadius: 14,
  background: "rgba(255, 255, 255, 0.75)",
  border: "1px solid rgba(0,0,0,0.06)",
  marginTop: 4,
  width: "100%",          
  justifyContent: "flex-start",
},


  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 16,
    background:
      "linear-gradient(135deg, rgba(255, 193, 7, 0.5), rgba(255, 152, 0, 0.35))",
    color: "#4a3000",
    flexShrink: 0,
  },

  userText: {
    textAlign: "left",
  },

  username: {
    fontWeight: 700,
    fontSize: 14,
    color: "#222",
  },

  meta: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  description: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 1.55,
    color: "#333",
    textAlign: "center",
  },
};
