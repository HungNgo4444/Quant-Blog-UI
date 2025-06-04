'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Folder,
  Article,
} from '@mui/icons-material';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Simulated data - replace with actual API call to backend
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Technology',
          slug: 'technology',
          description: 'Latest technology trends, innovations, and insights from the tech world',
          color: '#3b82f6',
          postCount: 15
        },
        {
          id: '2',
          name: 'Tutorial',
          slug: 'tutorial',
          description: 'Step-by-step guides and tutorials for developers',
          color: '#10b981',
          postCount: 23
        },
        {
          id: '3',
          name: 'Programming',
          slug: 'programming',
          description: 'Programming tips, best practices, and coding techniques',
          color: '#8b5cf6',
          postCount: 18
        },
        {
          id: '4',
          name: 'Web Development',
          slug: 'web-development',
          description: 'Frontend and backend web development topics',
          color: '#f59e0b',
          postCount: 31
        },
        {
          id: '5',
          name: 'DevOps',
          slug: 'devops',
          description: 'Infrastructure, deployment, and DevOps practices',
          color: '#ef4444',
          postCount: 12
        },
        {
          id: '6',
          name: 'Mobile Development',
          slug: 'mobile-development',
          description: 'iOS, Android, and cross-platform mobile development',
          color: '#06b6d4',
          postCount: 8
        }
      ];

      setCategories(mockCategories);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách danh mục');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Danh mục
        </Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={60} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Danh mục
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Khám phá các chủ đề và danh mục bài viết
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardActionArea
                component={Link}
                href={`/categories/${category.slug}`}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: category.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <Folder sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {category.name}
                      </Typography>
                      <Chip
                        icon={<Article />}
                        label={`${category.postCount} bài viết`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {category.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Chưa có danh mục nào
          </Typography>
        </Box>
      )}
    </Container>
  );
} 