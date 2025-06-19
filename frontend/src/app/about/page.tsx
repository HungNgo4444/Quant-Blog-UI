'use client';

import React from 'react';
import {
  Code,
  Create,
  Group,
  TrendingUp,
} from '@mui/icons-material';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Về Quant Blog</h1>
        <p className="text-xl text-gray-600 mb-8">
          Nền tảng chia sẻ kiến thức lập trình và công nghệ
        </p>
      </div>

      {/* Mission */}
      <Card className="mb-12">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold mb-4">Sứ mệnh</h2>
          <p className="text-gray-700 mb-4">
            Quant Blog được tạo ra với mục tiêu xây dựng một cộng đồng chia sẻ kiến thức lập trình 
            và công nghệ chất lượng cao. Chúng tôi tin rằng việc chia sẻ kiến thức không chỉ giúp 
            người khác học hỏi mà còn giúp bản thân chúng ta trở nên tốt hơn.
          </p>
          <p className="text-gray-700">
            Với các công cụ hiện đại và giao diện thân thiện, Quant Blog mong muốn trở thành 
            nơi mà mọi developer có thể dễ dàng chia sẻ kinh nghiệm, học hỏi từ nhau và 
            cùng nhau phát triển trong sự nghiệp.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Tính năng nổi bật</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full text-center">
              <CardContent className="p-6">
                <div className="text-blue-600 mb-4 flex justify-center">
                  {React.cloneElement(feature.icon, { style: { fontSize: 48 } })}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <Card className="mb-12">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold text-center mb-4">Công nghệ sử dụng</h2>
          <p className="text-center text-gray-600 mb-6">
            Quant Blog được xây dựng bằng các công nghệ hiện đại nhất
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {technologies.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-blue-600 border-blue-600"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8">Đội ngũ phát triển</h2>
        <div className="flex justify-center">
          <Card className="max-w-sm">
            <CardContent className="text-center p-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
                  alt="Quant Team"
                />
                <AvatarFallback>QT</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold mb-2">Quant Team</h3>
              <p className="text-gray-600 text-sm mb-4">Full-stack Developer</p>
              <p className="text-gray-700 text-sm">
                Đam mê tạo ra những sản phẩm công nghệ hữu ích cho cộng đồng developer
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 