'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { 
  Target, 
  Heart, 
  Users, 
  BookOpen, 
  Shield, 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

export default function AboutPage() {
  const reputationRules = [
    { action: 'Upvote câu hỏi của bạn', points: '+5', icon: ThumbsUp, color: 'text-green-600' },
    { action: 'Upvote câu trả lời của bạn', points: '+10', icon: ThumbsUp, color: 'text-green-600' },
    { action: 'Câu trả lời được chấp nhận', points: '+15', icon: CheckCircle, color: 'text-blue-600' },
    { action: 'Chấp nhận câu trả lời', points: '+2', icon: CheckCircle, color: 'text-blue-600' },
    { action: 'Downvote câu hỏi của bạn', points: '-2', icon: XCircle, color: 'text-red-600' },
    { action: 'Downvote câu trả lời của bạn', points: '-2', icon: XCircle, color: 'text-red-600' },
    { action: 'Vi phạm quy tắc cộng đồng', points: '-10', icon: AlertTriangle, color: 'text-red-600' },
  ];

  const communityGuidelines = [
    {
      title: 'Tôn trọng lẫn nhau',
      description: 'Luôn duy trì thái độ lịch sự và tôn trọng với mọi thành viên',
      icon: Heart,
      color: 'text-pink-600',
    },
    {
      title: 'Câu hỏi chất lượng',
      description: 'Đặt câu hỏi rõ ràng, cụ thể và đã tìm hiểu trước',
      icon: HelpCircle,
      color: 'text-blue-600',
    },
    {
      title: 'Câu trả lời hữu ích',
      description: 'Cung cấp câu trả lời chi tiết, chính xác và có thể áp dụng',
      icon: MessageSquare,
      color: 'text-green-600',
    },
    {
      title: 'Không spam',
      description: 'Tránh đăng nội dung trùng lặp hoặc không liên quan',
      icon: Shield,
      color: 'text-red-600',
    },
  ];

  const reputationLevels = [
    { level: 'Beginner', min: 0, max: 99, color: 'bg-gray-100 text-gray-700', description: 'Thành viên mới' },
    { level: 'Intermediate', min: 100, max: 499, color: 'bg-green-100 text-green-700', description: 'Đang học hỏi' },
    { level: 'Advanced', min: 500, max: 999, color: 'bg-blue-100 text-blue-700', description: 'Kinh nghiệm tốt' },
    { level: 'Expert', min: 1000, max: Infinity, color: 'bg-purple-100 text-purple-700', description: 'Chuyên gia' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Về cộng đồng</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nơi những lập trình viên web chia sẻ kiến thức, học hỏi và cùng nhau phát triển
          </p>
        </div>

        {/* Mission & Vision */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="h-6 w-6" />
              Mục tiêu và Tầm nhìn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">🎯 Mục tiêu</h3>
              <p className="text-blue-700">
                Tạo ra một môi trường học tập tích cực nơi các lập trình viên web có thể 
                đặt câu hỏi, chia sẻ kiến thức và giải quyết vấn đề cùng nhau.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">🌟 Tầm nhìn</h3>
              <p className="text-blue-700">
                Trở thành cộng đồng hàng đầu cho các nhà phát triển web Việt Nam, 
                nơi kiến thức được chia sẻ miễn phí và mọi người đều có thể học hỏi, phát triển.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">💝 Giá trị cốt lõi</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Tôn trọng</Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Kiến thức chính xác</Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Sự giúp đỡ</Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Học hỏi</Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Cộng đồng</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Quy tắc cộng đồng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityGuidelines.map((guideline, index) => (
                <div key={index} className="flex items-start gap-3">
                  <guideline.icon className={`h-6 w-6 ${guideline.color} mt-1 flex-shrink-0`} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{guideline.title}</h3>
                    <p className="text-gray-600 text-sm">{guideline.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-6" />
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Điều cần tránh
              </h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Sử dụng ngôn ngữ thô tục hoặc xúc phạm</li>
                <li>• Đăng câu hỏi trùng lặp hoặc không rõ ràng</li>
                <li>• Spam hoặc quảng cáo không phù hợp</li>
                <li>• Chia sẻ thông tin sai lệch hoặc không chính xác</li>
                <li>• Yêu cầu người khác làm hộ bài tập mà không nỗ lực</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Reputation System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-600" />
              Hệ thống điểm uy tín
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Điểm uy tín phản ánh đóng góp của bạn cho cộng đồng. Càng nhiều đóng góp chất lượng, 
              điểm uy tín của bạn càng cao.
            </p>
            
            {/* Reputation Levels */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Cấp độ uy tín</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reputationLevels.map((level, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4">
                      <Badge className={`${level.color} mb-2`}>
                        {level.level}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {level.min === 0 ? '0' : level.min.toLocaleString()} 
                        {level.max === Infinity ? '+' : ` - ${level.max.toLocaleString()}`} điểm
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Reputation Rules */}
            <div>
              <h3 className="font-semibold mb-4">Cách tính điểm uy tín</h3>
              <div className="space-y-3">
                {reputationRules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <rule.icon className={`h-5 w-5 ${rule.color}`} />
                      <span className="text-gray-700">{rule.action}</span>
                    </div>
                    <Badge 
                      variant={rule.points.startsWith('+') ? 'default' : 'destructive'}
                      className={rule.points.startsWith('+') ? 'bg-green-100 text-green-800' : ''}
                    >
                      {rule.points} điểm
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">💡 Mẹo tăng uy tín</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Đặt câu hỏi chất lượng với đầy đủ thông tin</li>
                <li>• Cung cấp câu trả lời chi tiết và hữu ích</li>
                <li>• Upvote các câu hỏi và câu trả lời hay</li>
                <li>• Chấp nhận câu trả lời tốt nhất cho câu hỏi của bạn</li>
                <li>• Tham gia tích cực và giúp đỡ người khác</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Hướng dẫn sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Cách đặt câu hỏi hiệu quả</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Tìm hiểu trước khi đặt câu hỏi</li>
                  <li>• Viết tiêu đề rõ ràng, cụ thể</li>
                  <li>• Mô tả chi tiết vấn đề bạn gặp phải</li>
                  <li>• Cung cấp code mẫu nếu có thể</li>
                  <li>• Đính kèm ảnh chụp màn hình nếu cần</li>
                  <li>• Sử dụng các tag phù hợp</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Cách trả lời chất lượng</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Đọc kỹ câu hỏi trước khi trả lời</li>
                  <li>• Cung cấp giải pháp cụ thể</li>
                  <li>• Giải thích lý do tại sao</li>
                  <li>• Đưa ra ví dụ code minh họa</li>
                  <li>• Tham khảo tài liệu chính thức</li>
                  <li>• Kiểm tra lại trước khi đăng</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">Liên hệ & Hỗ trợ</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-800">
            <p className="mb-4">
              Nếu bạn có thắc mắc về cộng đồng hoặc cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.
            </p>
            <div className="space-y-2 text-sm">
              <p>📧 Email: community@quantblog.dev</p>
              <p>💬 Discord: #community-support</p>
              <p>🐛 Báo lỗi: GitHub Issues</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}