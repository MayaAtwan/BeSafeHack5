import FeedbackHeader from "../src/components/FeedbackHeader";

function FeedbackPage() {
  return (
    <div style={styles.page }>
        <FeedbackHeader/>

      <h2>Feedback</h2>
      <p>Feedback analytics coming soon</p>
    </div>
  );
}

export default FeedbackPage;

const styles = {
  page: {
    width: "100%",
    maxWidth: 960,
    margin: "0 auto",
    padding: "16px",
    borderRadius: 18,
     background:
      "linear-gradient(135deg, rgba(255, 74, 168, 0.14), rgba(255, 255, 255, 0.95))",
    border: "1px solid rgba(255, 74, 168, 0.18)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    backdropFilter: "blur(10px)",
  },
};