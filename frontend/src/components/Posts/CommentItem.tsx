import React, { useState, useRef, useLayoutEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ThumbsUp, Reply, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib/utils";
import { Comment } from "./PostComment";
import { useSelector } from "react-redux";
import { RootState } from "frontend/src/store";
import Link from "next/link";

// Di chuyển CommentItem ra ngoài để tránh re-creation
interface CommentItemProps {
    comment: Comment;
    level?: number; // Thêm level để track độ sâu
    replyTo: string | null;
    replyContent: string;
    submitting: boolean;
    isAuthenticated: boolean;
    onReplyToggle: (commentId: string) => void;
    onReplyContentChange: (content: string) => void;
    onSubmitReply: (parentId: string) => void;
    onCancelReply: () => void;
    isLastInLevel?: boolean; // Thêm prop để biết có phải item cuối cùng trong level
  }
  
  const CommentItem: React.FC<CommentItemProps> = React.memo(({ 
    comment, 
    level = 0, // Default level 0
    replyTo,
    replyContent,
    submitting,
    isAuthenticated,
    onReplyToggle,
    onReplyContentChange,
    onSubmitReply,
    onCancelReply,
    isLastInLevel = false
  }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [commentHeight, setCommentHeight] = useState(0);
    const [childrenHeight, setChildrenHeight] = useState(0);
    const commentRef = useRef<HTMLDivElement>(null);
    const childrenRef = useRef<HTMLDivElement>(null);
    const {user} = useSelector((state: RootState) => state.auth);
    const isReply = level > 0;
    const canReply = level < 2; // Chỉ cho phép reply đến level 2 (tổng cộp 3 cấp)

    // Tính toán chiều cao thực tế
    useLayoutEffect(() => {
      if (commentRef.current) {
        setCommentHeight(commentRef.current.offsetHeight);
      }
      if (childrenRef.current) {
        setChildrenHeight(childrenRef.current.scrollHeight);
      }
    }, [showReplies, replyTo, comment.children?.length, comment.content]);

    // Tính toán vị trí avatar center
    const avatarSize = level === 0 ? 40 : level === 1 ? 36 : 32;
    const avatarCenter = avatarSize / 2;
    const marginLeft = level * 24;
    const verticalLineLeft = -30 + (level - 1) * 24; // Điều chỉnh vị trí theo level

    return (
      <div 
        ref={commentRef}
        className={cn(
          "relative",
          level === 0 ? "mb-4" : "mb-2"
        )}
      >

        {/* Đường ngang kết nối - hiển thị cho tất cả level > 0 */}
        {level > 0 && (
          <div 
            className="absolute h-0.5 bg-gray-300 dark:bg-gray-600 z-10"
            style={{
              left: -31,
              top: avatarCenter + 2,
              width: 55,
            }}
          >
            <div 
              className="absolute bg-gray-300 dark:bg-gray-600"
              style={{
                left: 0,
                top: -3,
                width: '6px',
                height: '6px',
                borderTopRightRadius: '6px',
                borderBottomRightRadius: '6px',
              }}
            />
          </div>
        )}

        <div 
          className="flex gap-3 items-start"
          style={{ marginLeft }}
        >
          {/* Avatar với đường nhánh xuất phát cho children */}
          <div className="relative">
            <Link href={`/profile/${comment.author.id}`}>
              <Avatar className={cn(
                "relative z-20 bg-white dark:bg-gray-800",
                level === 0 ? "w-10 h-10" : level === 1 ? "w-9 h-9" : "w-8 h-8",
                level > 0 && "border-2 border-white dark:border-gray-800"
              )}>
                <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {comment.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            {/* Đường dọc xuất phát từ avatar này xuống children */}
            {comment.children && comment.children.length > 0 && (level === 0 ? showReplies : true) && (
              <div 
                className="absolute w-0.5 bg-gray-300 dark:bg-gray-600 z-10"
                style={{
                  left: avatarCenter - 1,
                  top: avatarSize + 4,
                  height: childrenHeight > 0 ? commentHeight - 136 : 200,
                }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment Bubble */}
            <div className="inline-block max-w-full break-words bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 mb-1">
              <div className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">
                <Link href={`/profile/${comment.author.id}`}>
                  {comment.author.name}
                </Link>
              </div>
              
              <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {comment.content}
              </div>

              {comment.imageUrl && (
                <div className="mt-2">
                  <img
                    src={comment.imageUrl}
                    alt="Comment attachment"
                    className="max-w-full max-h-36 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 ml-2 mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(
                  new Date(comment.createdAt),
                  {
                    addSuffix: true,
                    locale: vi
                  }
                )}
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Thích
              </Button>

              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReplyToggle(comment.id)}
                  disabled={!isAuthenticated}
                  className="h-auto p-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Trả lời
                </Button>
              )}

              {comment.likeCount > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <ThumbsUp className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {comment.likeCount}
                  </span>
                </div>
              )}
            </div>

            {/* Reply Form */}
            {canReply && replyTo === comment.id && (
              <div className="ml-2 mb-4">
                <div className="flex gap-2 items-start">
                  <Avatar className="w-8 h-8">
                    {user?.avatar ? (
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                    ) : (
                      <AvatarFallback className="bg-blue-500 text-white">
                        {user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Viết trả lời..."
                      value={replyContent}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onReplyContentChange(e.target.value)}
                      className="resize-none rounded-3xl bg-gray-100 dark:bg-gray-700 border-none text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancelReply}
                        className="text-xs text-gray-600 dark:text-gray-400"
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onSubmitReply(comment.id)}
                        disabled={submitting || !replyContent.trim()}
                        className="text-xs bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-3xl px-4"
                      >
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Gửi'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Toggle Replies Button */}
            {level === 0 && comment.children && comment.children.length > 0 && (
              <div className="ml-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="h-auto p-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Ẩn phản hồi
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      {comment.children.length} phản hồi
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Replies */}
            {comment.children && comment.children.length > 0 && (
              <div 
                ref={childrenRef}
                className={cn(
                  "relative transition-all duration-300",
                  level === 0 ? (showReplies ? "max-h-none opacity-100" : "max-h-0 opacity-0") : "max-h-none opacity-100"
                )}
              >
                {comment.children.map((reply, index) => (
                  <CommentItem 
                    key={reply.id}
                    comment={reply} 
                    level={level + 1} // Tăng level
                    replyTo={replyTo}
                    replyContent={replyContent}
                    submitting={submitting}
                    isAuthenticated={isAuthenticated}
                    onReplyToggle={onReplyToggle}
                    onReplyContentChange={onReplyContentChange}
                    onSubmitReply={onSubmitReply}
                    onCancelReply={onCancelReply}
                    isLastInLevel={index === comment.children!.length - 1} // Xác định item cuối cùng
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
  
  export default CommentItem;