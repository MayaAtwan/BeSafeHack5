import ContentCategoryBarChart from "../src/components/ContentCategoryBarChart";
import FeedbackHeader from "../src/components/FeedbackHeader";
import SentimentPieChart from "../src/components/SentimentPieChart";

function FeedbackPage() {
    const positiveCount = 120;
    const negativeCount = 45;

    const sentimentData = [
    { label: "Positive", value: positiveCount, color: "#29c54dff" },
    { label: "Negative", value: negativeCount, color: "#db1d40ff" },
    ];

        const categoriesData = [
    {
        category: "Violence",
        value: 32,
        color: "#ff4afcff",
    },
    {
        category: "Hate Speech",
        value: 21,
        color: "#f68fffff",
    },
    {
        category: "Spam",
        value: 15,
        color: "#aa519bff",
    },
    {
        category: "Misinformation",
        value: 12,
        color: "#db39bbff",
    },
    ];

  return (
    <div style={styles.page }>
        <FeedbackHeader/>
        <div>
        <h3 style={{textAlign: "center"}}>Your Content Sentiment</h3>
        <SentimentPieChart data={sentimentData} />
        </div>

        <h3 style={{textAlign: "center"}}>What Kind of Harmful Content Appears in Your Feed</h3>    
        <ContentCategoryBarChart data={categoriesData} />

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