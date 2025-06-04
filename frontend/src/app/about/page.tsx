'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Paper,
} from '@mui/material';
import {
  Code,
  Create,
  Group,
  TrendingUp,
} from '@mui/icons-material';

export default function AboutPage() {
  const features = [
    {
      icon: <Create />,
      title: 'Viết Blog',
      description: 'Tạo và chia sẻ các bài viết chất lượng cao với markdown editor'
    },
    {
      icon: <Code />,
      title: 'Công nghệ',
      description: 'Chia sẻ kiến thức về lập trình và công nghệ mới nhất'
    },
    {
      icon: <Group />,
      title: 'Cộng đồng',
      description: 'Kết nối với các developer và blogger khác'
    },
    {
      icon: <TrendingUp />,
      title: 'Học hỏi',
      description: 'Nâng cao kỹ năng thông qua việc chia sẻ và thảo luận'
    }
  ];

  const technologies = [
    'Next.js 14',
    'TypeScript',
    'NestJS',
    'PostgreSQL',
    'Material-UI',
    'TailwindCSS',
    'Redux Toolkit',
    'TypeORM'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Về Quant Blog
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Nền tảng chia sẻ kiến thức lập trình và công nghệ
        </Typography>
      </Box>

      {/* Mission */}
      <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Sứ mệnh
        </Typography>
        <Typography variant="body1" paragraph>
          Quant Blog được tạo ra với mục tiêu xây dựng một cộng đồng chia sẻ kiến thức lập trình 
          và công nghệ chất lượng cao. Chúng tôi tin rằng việc chia sẻ kiến thức không chỉ giúp 
          người khác học hỏi mà còn giúp bản thân chúng ta trở nên tốt hơn.
        </Typography>
        <Typography variant="body1">
          Với các công cụ hiện đại và giao diện thân thiện, Quant Blog mong muốn trở thành 
          nơi mà mọi developer có thể dễ dàng chia sẻ kinh nghiệm, học hỏi từ nhau và 
          cùng nhau phát triển trong sự nghiệp.
        </Typography>
      </Paper>

      {/* Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Tính năng nổi bật
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {React.cloneElement(feature.icon, { sx: { fontSize: 48 } })}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Technologies */}
      <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Công nghệ sử dụng
        </Typography>
        <Typography variant="body1" paragraph textAlign="center" color="text.secondary">
          Quant Blog được xây dựng bằng các công nghệ hiện đại nhất
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {technologies.map((tech) => (
            <Chip
              key={tech}
              label={tech}
              variant="outlined"
              color="primary"
            />
          ))}
        </Box>
      </Paper>

      {/* Team */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Đội ngũ phát triển
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Card sx={{ maxWidth: 300 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              />
              <Typography variant="h6" gutterBottom>
                Quant Team
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Full-stack Developer
              </Typography>
              <Typography variant="body2">
                Đam mê tạo ra những sản phẩm công nghệ hữu ích cho cộng đồng developer
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
} 