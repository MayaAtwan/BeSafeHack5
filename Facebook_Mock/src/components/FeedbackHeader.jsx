import React from "react";

export default function FeedbackHeader({
  title = "Safety Feedback Report",
  subtitle = "A quick overview of the content appearing in your feed",
  tag = "Feedback",
}) {
  return (
    <header style={styles.wrapper}>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.subtitle}>{subtitle}</p>
      <div style={styles.divider} />
    </header>
  );
}

const styles = {
  wrapper: {
    padding: "clamp(16px, 4vw, 28px)",
    maxWidth: 960,
    margin: "0 auto",
  },

  topRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: 12,
  },

  tag: {
    fontSize: "clamp(11px, 2.5vw, 12px)",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255, 74, 168, 0.12)",
    border: "1px solid rgba(255, 74, 168, 0.2)",
    color: "rgb(160, 30, 90)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

    title: {
    margin: 0,
    fontSize: "clamp(22px, 6vw, 32px)",
    fontWeight: 900,
    color: "rgb(28, 28, 35)",
    lineHeight: 1.15,
    textAlign: "center",
    },


  subtitle: {
    marginTop: 10,
    maxWidth: 620,
    fontSize: "clamp(14px, 3.5vw, 16px)",
    color: "rgb(85, 85, 95)",
    lineHeight: 1.6,
    textAlign: "center",
  },

  divider: {
    marginTop: 18,
    height: 1,
    width: "100%",
    background:
      "linear-gradient(90deg, rgba(255, 74, 168, 0), rgba(255, 74, 168, 0.4), rgba(255, 74, 168, 0))",
  },
};
