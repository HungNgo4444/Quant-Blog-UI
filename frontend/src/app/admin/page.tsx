'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Overview } from '../../components/admin/dashboard/overview';
import { RecentPosts } from '../../components/admin/dashboard/recent-posts';
import { DashboardStats } from '../../components/admin/dashboard/stats';
import { useAppSelector } from '../../store';

export default function AdminPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-4 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h2>
        <p className="text-muted-foreground">
          Chào mừng trở lại, {user?.name}! Dưới đây là tổng quan về hệ thống.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats/>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Bài viết gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentPosts />
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
} 