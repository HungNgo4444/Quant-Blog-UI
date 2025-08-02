'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MessageSquare, HelpCircle, Trophy, Star } from 'lucide-react';
import Link from 'next/link';

interface UserStats {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  questionCount: number;
  answerCount: number;
  reputation: number;
  createdAt: string;
}

interface UserCardProps {
  user: UserStats;
}

export default function UserCard({ user }: UserCardProps) {
  const getReputationLevel = (reputation: number) => {
    if (reputation >= 1000) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (reputation >= 500) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (reputation >= 100) return { level: 'Intermediate', color: 'text-green-600', bg: 'bg-green-100' };
    return { level: 'Beginner', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const reputationInfo = getReputationLevel(user.reputation);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center space-y-3">
          <Link href={`/profile/${user.id}`}>
            <Avatar className="h-16 w-16 ring-2 ring-gray-200 hover:ring-blue-400 transition-all cursor-pointer">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="text-center">
            <Link 
              href={`/profile/${user.id}`}
              className="text-lg font-semibold hover:text-blue-600 transition-colors"
            >
              {user.name}
            </Link>
            {user.bio && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>

          <Badge 
            variant="secondary" 
            className={`${reputationInfo.bg} ${reputationInfo.color} font-medium`}
          >
            <Star className="h-3 w-3 mr-1" />
            {reputationInfo.level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Điểm uy tín</span>
            </div>
            <Badge variant="outline" className="font-bold text-yellow-700">
              {user.reputation.toLocaleString()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50">
              <HelpCircle className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-sm text-gray-600">Câu hỏi</span>
              <span className="text-lg font-bold text-blue-700">
                {user.questionCount}
              </span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-green-50">
              <MessageSquare className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-sm text-gray-600">Câu trả lời</span>
              <span className="text-lg font-bold text-green-700">
                {user.answerCount}
              </span>
            </div>
          </div>

          <div className="text-center pt-2 border-t">
            <Link 
              href={`/profile/${user.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              Xem hồ sơ đầy đủ →
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}