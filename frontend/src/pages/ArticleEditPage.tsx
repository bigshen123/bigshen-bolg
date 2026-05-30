import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Image as ImageIcon, Loader2, Plus, X } from 'lucide-react';
import MarkdownEditor from '../components/editor/MarkdownEditor';
import Button from '../components/common/Button';
import { articleService } from '../services/articleService';
import { categoryService } from '../services/categoryService';
import { mediaService } from '../services/mediaService';
import type { Category } from '../types/article';

/**
 * 文章编辑页（新建/编辑复用）
 */
const ArticleEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [status, setStatus] = useState('DRAFT');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [uploadingCover, setUploadingCover] = useState(false);

    /**
     * 加载分类列表
     */
    useEffect(() => {
        categoryService.getAllCategories().then(setCategories).catch(console.error);
    }, []);

    /**
     * 编辑模式：加载文章数据
     */
    useEffect(() => {
        if (!id) return;
        setInitialLoading(true);
        articleService.getArticleById(Number(id)).then((article) => {
            if (article) {
                setTitle(article.title);
                setContent(article.content);
                setSummary(article.summary);
                setCoverImage(article.coverImage);
                setStatus(article.status || 'DRAFT');
                setCategoryId(article.categoryId || null);
                setTags(article.tags || []);
            }
        }).catch(console.error).finally(() => setInitialLoading(false));
    }, [id]);

    /**
     * 上传封面图
     */
    const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploadingCover(true);
            const result = await mediaService.uploadImage(file, 0);
            setCoverImage(result.url);
        } catch (err) {
            console.error('封面上传失败:', err);
        } finally {
            setUploadingCover(false);
        }
    }, []);

    /**
     * 添加标签
     */
    const addTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t)) {
            setTags([...tags, t]);
        }
        setTagInput('');
    };

    /**
     * 移除标签
     */
    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    /**
     * 保存文章
     */
    const handleSave = async (publishStatus: string) => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空');
            return;
        }
        try {
            setLoading(true);
            const data = {
                title: title.trim(),
                content: content.trim(),
                summary: summary.trim(),
                coverImage,
                status: publishStatus,
                categoryId: categoryId || null,
                tags,
                location: '',
                travelDate: '',
            };

            if (isEdit && id) {
                await articleService.updateArticle(Number(id), data);
            } else {
                await articleService.createArticle(data);
            }
            navigate('/profile');
        } catch (err) {
            console.error('保存文章失败:', err);
            alert('保存失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center py-40">
                <Loader2 size={36} className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft size={18} /> 返回
                </button>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        onClick={() => handleSave('DRAFT')}
                        disabled={loading}
                    >
                        存草稿
                    </Button>
                    <Button
                        icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        onClick={() => handleSave('PUBLISHED')}
                        disabled={loading}
                    >
                        发布
                    </Button>
                </div>
            </div>

            {/* 标题 */}
            <motion.div
                className="bg-white rounded-3xl shadow-sm p-6 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <input
                    type="text"
                    placeholder="文章标题..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold text-gray-800 outline-none placeholder-gray-300"
                />
            </motion.div>

            {/* 封面图 */}
            <motion.div
                className="bg-white rounded-3xl shadow-sm p-6 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <label className="text-sm font-medium text-gray-600 mb-3 block">封面图片</label>
                {coverImage ? (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-3">
                        <img src={coverImage} alt="封面" className="w-full h-full object-cover" />
                        <button
                            onClick={() => setCoverImage('')}
                            className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : null}
                <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl cursor-pointer
                                  border-2 border-dashed border-gray-200 hover:border-pink-200 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    {uploadingCover ? (
                        <Loader2 size={18} className="animate-spin text-gray-400" />
                    ) : (
                        <ImageIcon size={18} className="text-gray-400" />
                    )}
                    <span className="text-sm text-gray-500">
                        {uploadingCover ? '上传中...' : coverImage ? '更换封面' : '上传封面图'}
                    </span>
                </label>
            </motion.div>

            {/* 摘要 */}
            <motion.div
                className="bg-white rounded-3xl shadow-sm p-6 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <label className="text-sm font-medium text-gray-600 mb-2 block">摘要</label>
                <textarea
                    placeholder="简短描述文章内容..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl outline-none border-2 border-transparent
                             focus:border-pink-200 text-sm resize-none h-20"
                />
            </motion.div>

            {/* 分类和标签 */}
            <motion.div
                className="bg-white rounded-3xl shadow-sm p-6 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                {/* 分类选择 */}
                <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">分类</label>
                    <select
                        value={categoryId || ''}
                        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full p-3 bg-gray-50 rounded-xl outline-none border-2 border-transparent
                                 focus:border-pink-200 text-sm"
                    >
                        <option value="">选择分类</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* 标签输入 */}
                <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">标签</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="添加标签..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                }
                            }}
                            className="flex-1 p-3 bg-gray-50 rounded-xl outline-none border-2 border-transparent
                                     focus:border-pink-200 text-sm"
                        />
                        <button
                            onClick={addTag}
                            className="px-3 py-2 bg-pink-50 text-pink-500 rounded-xl hover:bg-pink-100
                                     transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-pink-50 text-pink-500
                                             text-xs rounded-full"
                                >
                                    #{tag}
                                    <button onClick={() => removeTag(tag)}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Markdown 编辑器 */}
            <motion.div
                className="bg-white rounded-3xl shadow-sm p-6 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <label className="text-sm font-medium text-gray-600 mb-3 block">正文（Markdown）</label>
                <MarkdownEditor value={content} onChange={setContent} />
            </motion.div>
        </div>
    );
};

export default ArticleEditPage;
