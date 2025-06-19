'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Avatar, Skeleton } from '@mui/material';
import { TrendingUp, Visibility, Group, Category } from '@mui/icons-material';
import { DashboardStats, ApiResponse } from '../../types';
import instanceApi from 'frontend/src/lib/axios';
import axios from 'axios';

const ClientSideStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`);
        const response: ApiResponse<DashboardStats> = res.data;
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchStats();
    }
  }, [mounted]);

  const statsConfig = [
    {
      label: 'Bài viết',
      value: stats?.posts.total.toLocaleString('vi-VN') || '0',
      icon: <TrendingUp />,
      loading: loading,
    },
    {
      label: 'Lượt xem',
      value: stats?.posts.views.toLocaleString('vi-VN') || '0',
      icon: <Visibility />,
      loading: loading,
    },
    {
      label: 'Tác giả',
      value: stats?.users.total.toLocaleString('vi-VN') || '0',
      icon: <Group />,
      loading: loading,
    },
    {
      label: 'Thể loại',
      value: stats?.categories.total.toLocaleString('vi-VN') || '0',
      icon: <Category />,
      loading: loading,
    },
  ];

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (error) {
    return (
      <Box className="py-16 bg-gray-50 dark:bg-gray-800">
        <Container maxWidth="lg">
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="py-16 bg-gray-50 dark:bg-gray-800">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {statsConfig.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box className="text-center">
                <Box className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full mb-4">
                  {stat.icon}
                </Box>
                {stat.loading ? (
                  <>
                    <Skeleton variant="text" width="60%" className="mx-auto mb-2" />
                    <Skeleton variant="text" width="40%" className="mx-auto" />
                  </>
                ) : (
                  <>
                    <Typography variant="h4" className="font-bold mb-2">
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ClientSideStats;