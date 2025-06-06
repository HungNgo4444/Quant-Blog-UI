'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Stack,
  Collapse,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Reply as ReplyIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Image as ImageIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';
import instanceApi from '../../lib/axios';
import { clientCookies } from '../../services/TokenService';
import CommentItem from './CommentItem';
import { readFile } from 'frontend/src/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Comment {
  id: string;
  content: string;
  imageUrl?: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  children?: Comment[];
}

interface PostCommentProps {
  postId: string;
}


export default function PostComment({ postId }: PostCommentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check authentication
  useEffect(() => {
    const tokens = clientCookies.getAuthTokens();
    console.log(tokens);
    setIsAuthenticated(!!tokens?.accessToken);
  }, []);

  // Fetch comments
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/comments/post/${postId}?page=${page}&limit=10`);
      
      if (page === 1) {
        setComments(response.data.comments);
      } else {
        setComments(prev => [...prev, ...response.data.comments]);
      }
      
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError('Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const base64File= await readFile(event.target.files[0])
      setSelectedImage(base64File)
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      alert('Bạn cần đăng nhập để bình luận');
      return;
    }

    try {
      setSubmitting(true);

      const commentData = {
        content: newComment,
        postId,
        imageUrl: selectedImage || undefined
      };

      const response = await instanceApi.post('/comments', commentData);

      // Add new comment to top of list
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      setSelectedImage('');
      setError(null);
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      if (err.response?.status === 401) {
        alert('Bạn cần đăng nhập để bình luận');
      } else {
        setError('Không thể gửi bình luận');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    if (!isAuthenticated) {
      alert('Bạn cần đăng nhập để trả lời');
      return;
    }

    try {
      setSubmitting(true);

      const replyData = {
        content: replyContent,
        postId,
        parentId
      };

      const response = await instanceApi.post('/comments', replyData);

      // Update comments to include new reply
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { 
              ...comment, 
              children: [...(comment.children || []), response.data],
              replyCount: comment.replyCount + 1
            }
          : comment
      ));

      setReplyContent('');
      setReplyTo(null);
      setError(null);
    } catch (err: any) {
      console.error('Error submitting reply:', err);
      setError('Không thể gửi trả lời');
    } finally {
      setSubmitting(false);
    }
  };

  // Sử dụng useCallback để tránh re-creation của handlers
  const handleReplyToggle = useCallback((commentId: string) => {
    setReplyTo(replyTo === commentId ? null : commentId);
    setReplyContent('');
  }, [replyTo]);

  const handleReplyContentChange = useCallback((content: string) => {
    setReplyContent(content);
  }, []);

  const handleSubmitReply = useCallback((parentId: string) => {
    submitReply(parentId);
  }, [replyContent, isAuthenticated, postId]);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
    setReplyContent('');
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Bình luận ({comments.reduce((total, comment) => total + 1 + (comment.children?.length || 0), 0)})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Comment Form */}
      {isAuthenticated ? (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Viết bình luận của bạn..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {selectedImage && (
            <Box sx={{ mb: 2 }}>
              <span style={{position: 'relative', display: 'inline-block'}}>
                <img src={selectedImage} alt="Selected" style={{ width: 'auto', height: '70px', borderRadius: '8px', border: '1px solid #aaa' }} />
                <IconButton sx={{ '&:hover': { backgroundColor: '#ddd' }, position: 'absolute', top: 4, right: 4, backgroundColor: 'white', borderRadius: '50%', padding: '2px', border: '1px solid red'}} onClick={() => setSelectedImage('')}>
                  <CloseIcon sx={{ color: 'red', fontSize: '14px' }} />
                </IconButton>
              </span>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageSelect}
              />
              <label htmlFor="image-upload">
                <IconButton component="span" color="primary">
                  <ImageIcon />
                </IconButton>
              </label>
            </Box>

            <Button
              variant="contained"
              startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Bạn cần đăng nhập để bình luận.
        </Alert>
      )}

      {/* Comments List */}
      {loading && page === 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              replyTo={replyTo}
              replyContent={replyContent}
              submitting={submitting}
              isAuthenticated={isAuthenticated}
              onReplyToggle={handleReplyToggle}
              onReplyContentChange={handleReplyContentChange}
              onSubmitReply={handleSubmitReply}
              onCancelReply={handleCancelReply}
            />
          ))}

          {/* Load More Button */}
          {page < totalPages && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Xem thêm bình luận'}
              </Button>
            </Box>
          )}

          {comments.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}