import { useState } from "react";

export default function FloatingToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div style={styles.container}>
      <span style={styles.label}>
        {enabled ? "ON" : "OFF"}
      </span>

      <label style={styles.switch}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
        />
        <span style={styles.slider}></span>
      </label>
    </div>
  );
}

const styles = {
container: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#fff",
  padding: "10px 14px",
  borderRadius: "999px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
},

  label: {
    fontSize: "14px",
    fontWeight: 600
  },

  switch: {
    position: "relative",
    width: "42px",
    height: "24px"
  },

  slider: {
    position: "absolute",
    cursor: "pointer",
    inset: 0,
    backgroundColor: "#ccc",
    borderRadius: "999px",
    transition: "0.3s"
  }
};
