import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ContentCategoryBarChart({ data }) {
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div style={{ width: "100%", height: 260, marginTop: 20 }}>
      <ResponsiveContainer>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
           dataKey="category"
            type="category"
            width={120} 
            tick={{
                fontSize: 15,
                fill: "#100909ff",
                textAnchor: "start",

            }}
            />
          <Tooltip />
          <Bar dataKey="value">
            {sortedData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
