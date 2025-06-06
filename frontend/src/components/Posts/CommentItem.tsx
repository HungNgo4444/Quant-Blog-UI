import { Box, Paper, Typography, Avatar, IconButton, Button, Collapse, TextField, CircularProgress } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useState } from "react";
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Comment } from "./PostComment";

// Di chuyển CommentItem ra ngoài để tránh re-creation
interface CommentItemProps {
    comment: Comment;
    isReply?: boolean;
    replyTo: string | null;
    replyContent: string;
    submitting: boolean;
    isAuthenticated: boolean;
    onReplyToggle: (commentId: string) => void;
    onReplyContentChange: (content: string) => void;
    onSubmitReply: (parentId: string) => void;
    onCancelReply: () => void;
  }
  
  const CommentItem: React.FC<CommentItemProps> = React.memo(({ 
    comment, 
    isReply = false,
    replyTo,
    replyContent,
    submitting,
    isAuthenticated,
    onReplyToggle,
    onReplyContentChange,
    onSubmitReply,
    onCancelReply
  }) => {
    const [showReplies, setShowReplies] = useState(false);

    return (
      <Paper 
        elevation={isReply ? 1 : 2} 
        sx={{ 
          p: 2, 
          mb: isReply ? 1 : 2,
          ml: isReply ? 4 : 0,
          borderLeft: isReply ? '3px solid #1976d2' : 'none'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar
            src={comment.author.avatar}
            alt={comment.author.name}
            sx={{ width: isReply ? 32 : 40, height: isReply ? 32 : 40 }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {comment.author.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(
                  new Date(new Date(comment.createdAt).getTime() + 7 * 60 * 60 * 1000), 
                  {
                      addSuffix: true,
                      locale: vi
                  }
                  )}
              </Typography>
            </Box>
    
            <Typography variant="body2" sx={{ mb: 2 }}>
              {comment.content}
            </Typography>
    
            {comment.imageUrl && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={comment.imageUrl}
                  alt="Comment attachment"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #aaa'
                  }}
                />
              </Box>
            )}
    
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton size="small">
                <ThumbUpOutlinedIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption">
                {comment.likeCount} thích
              </Typography>
    
              {!isReply && (
                <Button
                  size="small"
                  startIcon={<ReplyIcon />}
                  onClick={() => onReplyToggle(comment.id)}
                  disabled={!isAuthenticated}
                >
                  Trả lời ({comment.replyCount})
                </Button>
              )}
            </Box>
    
            {/* Reply Form */}
            <Collapse in={replyTo === comment.id}>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Viết trả lời..."
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  variant="outlined"
                  size="small"
                  autoFocus
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={submitting || !replyContent.trim()}
                  >
                    {submitting ? <CircularProgress size={16} /> : 'Gửi'}
                  </Button>
                  <Button
                    size="small"
                    onClick={onCancelReply}
                  >
                    Hủy
                  </Button>
                </Box>
              </Box>
            </Collapse>

            {/* Toggle Replies Button */}
            {!isReply && comment.children && comment.children.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowReplies(!showReplies)}
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    '&:hover': { 
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      color: 'primary.main'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {showReplies 
                    ? 'Ẩn phản hồi' 
                    : `Xem tất cả ${comment.children.length} phản hồi`
                  }
                </Button>
              </Box>
            )}
    
            {/* Replies */}
            {comment.children && comment.children.length > 0 && (
              <Collapse 
                in={showReplies}
                timeout={300}
                sx={{
                  '& .MuiCollapse-wrapper': {
                    '& .MuiCollapse-wrapperInner': {
                      transition: 'transform 0.3s ease-in-out'
                    }
                  }
                }}
              >
                <Box sx={{ mt: 1 }}>
                  {comment.children.map((reply, index) => (
                    <Box
                      key={reply.id}
                      sx={{
                        opacity: showReplies ? 1 : 0,
                        transform: showReplies ? 'translateY(0)' : 'translateY(-10px)',
                        transition: `all 0.3s ease-in-out ${index * 0.1}s`
                      }}
                    >
                      <CommentItem 
                        comment={reply} 
                        isReply 
                        replyTo={replyTo}
                        replyContent={replyContent}
                        submitting={submitting}
                        isAuthenticated={isAuthenticated}
                        onReplyToggle={onReplyToggle}
                        onReplyContentChange={onReplyContentChange}
                        onSubmitReply={onSubmitReply}
                        onCancelReply={onCancelReply}
                      />
                    </Box>
                  ))}
                </Box>
              </Collapse>
            )}
          </Box>
        </Box>
      </Paper>
    );
  });
  
  export default CommentItem;