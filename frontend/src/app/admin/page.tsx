'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Article,
  People,
  Visibility,
  ThumbUp,
  MoreVert,
  Schedule,
  Public,
  ArticleOutlined as Draft,
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { formatDate } from '../../lib/utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface DashboardStats {
  totalPosts: number;
  totalUsers: number;
  totalViews: number;
  totalLikes: number;
  publishedPosts: number;
  draftPosts: number;
  newUsersThisMonth: number;
  viewsThisMonth: number;
  viewsGrowth: number;
  usersGrowth: number;
}

interface RecentPost {
  id: string;
  title: string;
  status: 'published' | 'draft';
  views: number;
  likes: number;
  createdAt: string;
  author: {
    name: string;
    avatar?: string;
  };
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  role: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    totalLikes: 0,
    publishedPosts: 0,
    draftPosts: 0,
    newUsersThisMonth: 0,
    viewsThisMonth: 0,
    viewsGrowth: 0,
    usersGrowth: 0,
  });

  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulated data - replace with actual API calls
      setStats({
        totalPosts: 45,
        totalUsers: 1284,
        totalViews: 15647,
        totalLikes: 2341,
        publishedPosts: 38,
        draftPosts: 7,
        newUsersThisMonth: 89,
        viewsThisMonth: 3452,
        viewsGrowth: 12.5,
        usersGrowth: 8.3,
      });

      setRecentPosts([
        {
          id: '1',
          title: 'Hướng dẫn sử dụng TypeScript hiệu quả',
          status: 'published',
          views: 1234,
          likes: 89,
          createdAt: '2024-01-15',
          author: { name: 'John Doe', avatar: '/avatars/john.jpg' }
        },
        {
          id: '2',
          title: 'React Server Components: Tương lai của React',
          status: 'draft',
          views: 0,
          likes: 0,
          createdAt: '2024-01-14',
          author: { name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
        },
        {
          id: '3',
          title: 'NestJS vs Express: So sánh chi tiết',
          status: 'published',
          views: 892,
          likes: 67,
          createdAt: '2024-01-13',
          author: { name: 'Bob Wilson', avatar: '/avatars/bob.jpg' }
        },
      ]);

      setRecentUsers([
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          avatar: '/avatars/alice.jpg',
          createdAt: '2024-01-15',
          role: 'user'
        },
        {
          id: '2',
          name: 'David Chen',
          email: 'david@example.com',
          createdAt: '2024-01-14',
          role: 'user'
        },
        {
          id: '3',
          name: 'Emma Davis',
          email: 'emma@example.com',
          avatar: '/avatars/emma.jpg',
          createdAt: '2024-01-13',
          role: 'editor'
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Tổng bài viết',
      value: stats.totalPosts,
      icon: <Article sx={{ fontSize: 40 }} />,
      color: 'primary',
      trend: '+5 tuần này',
      trendUp: true,
    },
    {
      title: 'Người dùng',
      value: stats.totalUsers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: 'success',
      trend: `+${stats.usersGrowth}% tháng này`,
      trendUp: true,
    },
    {
      title: 'Lượt xem',
      value: stats.totalViews.toLocaleString(),
      icon: <Visibility sx={{ fontSize: 40 }} />,
      color: 'info',
      trend: `+${stats.viewsGrowth}% tháng này`,
      trendUp: true,
    },
    {
      title: 'Lượt thích',
      value: stats.totalLikes.toLocaleString(),
      icon: <ThumbUp sx={{ fontSize: 40 }} />,
      color: 'warning',
      trend: '+23 hôm nay',
      trendUp: true,
    },
  ];

  // Chart data
  const viewsChartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Lượt xem',
        data: [1200, 1900, 1500, 2100, 1800, 2400, 2200],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const postsStatusData = {
    labels: ['Đã xuất bản', 'Bản nháp'],
    datasets: [
      {
        data: [stats.publishedPosts, stats.draftPosts],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const topCategoriesData = {
    labels: ['Technology', 'Tutorial', 'News', 'Review', 'Guide'],
    datasets: [
      {
        label: 'Số bài viết',
        data: [12, 19, 3, 5, 8],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (loading) {
    return (
      <Box>
        {[...Array(4)].map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <LinearProgress />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" className="mb-6 font-bold">
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="h-full">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="h4" className="font-bold mb-1">
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                    <Box className="flex items-center mt-2">
                      {card.trendUp ? (
                        <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                      ) : (
                        <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{ color: card.trendUp ? 'success.main' : 'error.main' }}
                      >
                        {card.trend}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      color: `${card.color}.main`,
                      opacity: 0.7,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} className="mb-6">
        {/* Views Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Lượt xem theo ngày"
              action={
                <IconButton>
                  <MoreVert />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Line data={viewsChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Posts Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Trạng thái bài viết" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Doughnut data={postsStatusData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Danh mục phổ biến" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Bar data={topCategoriesData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Posts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Bài viết gần đây" />
            <CardContent sx={{ p: 0 }}>
              <List>
                {recentPosts.map((post, index) => (
                  <React.Fragment key={post.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar src={post.author.avatar} alt={post.author.name}>
                          {post.author.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box className="flex items-center justify-between">
                            <Typography variant="subtitle2" className="line-clamp-1">
                              {post.title}
                            </Typography>
                            <Chip
                              label={post.status === 'published' ? 'Xuất bản' : 'Nháp'}
                              size="small"
                              color={post.status === 'published' ? 'success' : 'warning'}
                              icon={post.status === 'published' ? <Public /> : <Draft />}
                            />
                          </Box>
                        }
                        secondary={
                          <Box className="flex items-center justify-between mt-1">
                            <Typography variant="caption" color="text.secondary">
                              {post.author.name} • {formatDate(post.createdAt)}
                            </Typography>
                            <Box className="flex items-center gap-2">
                              <Box className="flex items-center">
                                <Visibility sx={{ fontSize: 14, mr: 0.5 }} />
                                <Typography variant="caption">{post.views}</Typography>
                              </Box>
                              <Box className="flex items-center">
                                <ThumbUp sx={{ fontSize: 14, mr: 0.5 }} />
                                <Typography variant="caption">{post.likes}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentPosts.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Users */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Người dùng mới" />
            <CardContent sx={{ p: 0 }}>
              <List>
                {recentUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar src={user.avatar} alt={user.name}>
                          {user.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box className="flex items-center justify-between">
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Chip
                              label={user.role}
                              size="small"
                              color={user.role === 'admin' ? 'error' : user.role === 'editor' ? 'warning' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box className="flex items-center justify-between">
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Box className="flex items-center">
                              <Schedule sx={{ fontSize: 14, mr: 0.5 }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(user.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentUsers.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 