import { getAdminOverview } from "../../../services/AdminService";
import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MonthlyData {
  name: string;
  month: number;
  total: number;
}

export function Overview() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminOverview();
        setData(response.data || []);
      } catch (error) {
        console.error('Error fetching overview data:', error);
        // Fallback data nếu API lỗi
        setData([
          { name: "T1", month: 1, total: 0 },
          { name: "T2", month: 2, total: 0 },
          { name: "T3", month: 3, total: 0 },
          { name: "T4", month: 4, total: 0 },
          { name: "T5", month: 5, total: 0 },
          { name: "T6", month: 6, total: 0 },
          { name: "T7", month: 7, total: 0 },
          { name: "T8", month: 8, total: 0 },
          { name: "T9", month: 9, total: 0 },
          { name: "T10", month: 10, total: 0 },
          { name: "T11", month: 11, total: 0 },
          { name: "T12", month: 12, total: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="text-muted-foreground">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 