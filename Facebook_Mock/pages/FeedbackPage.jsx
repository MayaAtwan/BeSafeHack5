import ContentCategoryBarChart from "../src/components/ContentCategoryBarChart";
import FeedbackHeader from "../src/components/FeedbackHeader";
import SentimentPieChart from "../src/components/SentimentPieChart";
import UserWarningCard from "../src/components/UserWarningCard";
import { useEffect, useState } from "react";

function FeedbackPage() {

    // fetch from api
  const [harmfulCount, setHarmfulCount] = useState(0);
  const [positiveCount, setPositiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const userId = "u1";
  const [categoriesData, setCategoriesData] = useState([]);

    // colors for each category
    const CATEGORY_COLORS = {
  "אלימות": "#ff4afcff",
  "שפה פוגענית": "#f68fffff",
  "בריונות / השפלה": "#aa519bff",
  "הטרדה / איום": "#db39bbff",
  "לחץ חברתי / התמכרות": "#ff7a45",
  "עידוד להתנהגות מסוכנת": "#ffcc00",
  "אחר (שלילי)": "#999999",
  "דימוי גוף שלילי": "#ff6f91",
};

useEffect(() => {
  async function fetchStats() {
    try {
      const res = await fetch(`http://localhost:3000/dashboard/${userId}`);
      const data = await res.json();

      setHarmfulCount(data.harmfulCount);
      setPositiveCount(data.positiveCount);

      const labelsMap = data.labelsCount || {};

      const categoriesArray = Object.entries(labelsMap).map(
        ([category, value]) => ({
          category,
          value,
          color: CATEGORY_COLORS[category] || "#cccccc",
        })
      );

      setCategoriesData(categoriesArray);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }

  fetchStats();
}, [userId]);


  if (loading) return <p>Loading...</p>;

    const sentimentData = [
    { label: "Positive", value: positiveCount, color: "#29c54dff" },
    { label: "Negative", value: harmfulCount, color: "#db1d40ff" },
    ];




  return (
    <div style={styles.page }>
        <FeedbackHeader/>
        <div>
        <h3 style={{textAlign: "center"}}>Your Content Sentiment</h3>
        <SentimentPieChart data={sentimentData} />
        </div>

        <h3 style={{textAlign: "center"}}>What Kind of Harmful Content Appears in Your Feed</h3>    
        {categoriesData.length > 0 && (
          <ContentCategoryBarChart data={categoriesData} />
        )}
        <UserWarningCard username={"Sharon Levi"} />

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