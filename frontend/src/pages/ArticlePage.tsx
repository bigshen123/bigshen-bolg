import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, MessageCircle, Loader2 } from 'lucide-react';
import { useThemeContext } from '../components/theme/ThemeProvider';
import AnimalAvatar from '../components/theme/AnimalAvatar';
import Button from '../components/common/Button';
import { formatDate, formatCount } from '../utils/validation';
import { articleService } from '../services/articleService';
import { commentService } from '../services/commentService';
import type { Article } from '../types/article';
import type { Comment } from '../types/user';

/**
 * 文章详情页
 */
const ArticlePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { config } = useThemeContext();

    const [article, setArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [liking, setLiking] = useState(false);
    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [replying, setReplying] = useState<number | null>(null);

    /**
     * 加载文章详情
     */
    const loadArticle = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await articleService.getArticleById(Number(id));
            setArticle(data);
        } catch (err) {
            console.error('加载文章详情失败:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    /**
     * 加载评论列表
     */
    const loadComments = useCallback(async () => {
        if (!id) return;
        try {
            const data = await commentService.getComments(Number(id));
            setComments(data);
        } catch (err) {
            console.error('加载评论失败:', err);
        }
    }, [id]);

    useEffect(() => {
        loadArticle();
        loadComments();
    }, [loadArticle, loadComments]);

    /**
     * 点赞文章
     */
    const handleLike = async () => {
        if (!id || liking) return;
        try {
            setLiking(true);
            const updated = await articleService.likeArticle(Number(id));
            if (updated) {
                setArticle(updated);
            }
        } catch (err) {
            console.error('点赞失败:', err);
        } finally {
            setLiking(false);
        }
    };

    /**
     * 发表评论
     */
    const handleSubmitComment = async () => {
        if (!id || !commentText.trim() || submittingComment) return;
        try {
            setSubmittingComment(true);
            const newComment = await commentService.addComment(Number(id), commentText.trim());
            setComments((prev) => [...prev, newComment]);
            setCommentText('');
        } catch (err) {
            console.error('发表评论失败:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    /**
     * 回复评论
     */
    const handleReply = async (commentId: number) => {
        const text = replyText[commentId]?.trim();
        if (!text) return;
        try {
            const reply = await commentService.replyToComment(commentId, text);
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? { ...c, replies: [...(c.replies || []), reply] }
                        : c
                )
            );
            setReplyText((prev) => ({ ...prev, [commentId]: '' }));
            setReplying(null);
        } catch (err) {
            console.error('回复评论失败:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <Loader2 size={36} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="text-center py-20 text-gray-400">
                <p className="text-lg">文章不存在或已被删除</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-pink-400 hover:underline">
                    返回上一页
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* 返回按钮 */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                <span>返回</span>
            </button>

            {/* 文章头部 */}
            <motion.div
                className="relative rounded-3xl overflow-hidden mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <AnimalAvatar animal={config.animalCharacter} size="md" />
                        <div className="text-white">
                            <div className="font-semibold">{article.authorName}</div>
                            <div className="text-sm text-white/70">{formatDate(article.createdAt)}</div>
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{article.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
                        {article.location && (
                            <span className="flex items-center gap-1">📍 {article.location}</span>
                        )}
                        {article.travelDate && (
                            <span className="flex items-center gap-1">📅 {article.travelDate}</span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* 标签 */}
            {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {article.tags.map((tag: string) => (
                        <span
                            key={tag}
                            className="cartoon-tag bg-pink-50 text-pink-500 text-sm"
                            style={{ backgroundColor: `${config.colors.primary}20`, color: config.colors.primary }}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* 文章内容 */}
            <motion.div
                className="bg-white rounded-3xl shadow-sm p-6 md:p-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </motion.div>

            {/* 互动区域 */}
            <div className="flex items-center justify-center gap-4 mb-8">
                <Button
                    variant="outline"
                    icon={liking ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} />}
                    className="rounded-full"
                    onClick={handleLike}
                    disabled={liking}
                >
                    {formatCount(article.likeCount)} 赞
                </Button>
                <Button variant="outline" icon={<MessageCircle size={18} />} className="rounded-full">
                    {article.commentCount} 评论
                </Button>
                <Button variant="outline" icon={<Share2 size={18} />} className="rounded-full">
                    分享
                </Button>
            </div>

            {/* 评论区 */}
            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">💬 评论 ({comments.length})</h2>

                {/* 发表评论 */}
                <div className="flex gap-3 mb-8">
                    <AnimalAvatar animal={config.animalCharacter} size="sm" />
                    <div className="flex-1">
                        <textarea
                            placeholder="写下你的想法..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-2xl border-2 border-transparent
                                     focus:border-pink-200 outline-none resize-none text-sm min-h-20
                                     transition-all"
                        />
                        <div className="flex justify-end mt-2">
                            <Button
                                size="sm"
                                onClick={handleSubmitComment}
                                disabled={!commentText.trim() || submittingComment}
                            >
                                {submittingComment ? '发送中...' : '发送'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 评论列表 */}
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>暂无评论，来发表第一条评论吧~</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id}>
                                <motion.div
                                    className="flex gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                                    whileHover={{ x: 4 }}
                                >
                                    <span className="text-2xl flex-shrink-0">
                                        {comment.userAvatar || '🐾'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm text-gray-800">
                                                {comment.username}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{comment.content}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-400">
                                                <Heart size={12} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReplying(replying === comment.id ? null : comment.id);
                                                    setReplyText((prev) => ({ ...prev, [comment.id]: '' }));
                                                }}
                                                className="text-xs text-gray-400 hover:text-gray-600"
                                            >
                                                回复
                                            </button>
                                        </div>
                                        {/* 回复输入框 */}
                                        {replying === comment.id && (
                                            <div className="flex gap-2 mt-2">
                                                <input
                                                    type="text"
                                                    placeholder={`回复 ${comment.username}...`}
                                                    value={replyText[comment.id] || ''}
                                                    onChange={(e) =>
                                                        setReplyText((prev) => ({
                                                            ...prev,
                                                            [comment.id]: e.target.value,
                                                        }))
                                                    }
                                                    className="flex-1 px-3 py-1.5 bg-gray-50 rounded-xl text-sm
                                                             outline-none border border-gray-200 focus:border-pink-200"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleReply(comment.id);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleReply(comment.id)}
                                                    className="px-3 py-1 text-xs text-pink-500 hover:bg-pink-50
                                                             rounded-lg transition-colors"
                                                >
                                                    回复
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                                {/* 子回复 */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="ml-10 border-l-2 border-gray-100 pl-4 space-y-3 mt-2">
                                        {comment.replies.map((reply) => (
                                            <motion.div
                                                key={reply.id}
                                                className="flex gap-3 p-2 rounded-xl hover:bg-gray-50"
                                                whileHover={{ x: 2 }}
                                            >
                                                <span className="text-lg flex-shrink-0">
                                                    {reply.userAvatar || '🐾'}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-medium text-xs text-gray-700">
                                                            {reply.username}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {formatDate(reply.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{reply.content}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticlePage;
