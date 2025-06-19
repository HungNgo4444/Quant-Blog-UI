"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Article, People, Category, Visibility, ThumbUp, TrendingUp } from "@mui/icons-material";
import { getAdminStats } from "frontend/src/services/AdminService";

export function DashboardStats() {
  const [statsData, setStatsData] = useState<any>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getAdminStats();
        setStatsData(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
          <Article className="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData?.posts?.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng lượt xem</CardTitle>
          <Visibility className="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData?.posts?.views}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
          <People className="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData?.users?.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng danh mục</CardTitle>
          <Category className="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData?.categories?.total}</div>
        </CardContent>
      </Card>
    </>
  );
} 