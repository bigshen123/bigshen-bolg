import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, ImageIcon, Loader2, Trash2, X, Download } from 'lucide-react';
import { articleService } from '../services/articleService';
import { mediaService, type MediaItem } from '../services/mediaService';
import type { Article } from '../types/article';

interface PhotoItem {
    id: string;
    url: string;
    description: string;
    source: 'article' | 'media';
    /** 媒体表记录的原始ID（仅 source='media' 时有值，用于删除） */
    mediaId?: number;
}

/**
 * 相册页面 - 展示文章封面图 + 独立上传的图库照片
 */
const GalleryPage = () => {
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * 加载图库数据：文章封面图 + 独立上传照片
     */
    const loadGallery = useCallback(async () => {
        try {
            setLoading(true);

            const [articleResult, galleryMedia] = await Promise.all([
                articleService.getArticles(0, 100),
                mediaService.getGalleryPhotos().catch(() => [] as MediaItem[]),
            ]);

            const photoList: PhotoItem[] = [];

            if (articleResult) {
                const data = articleResult as unknown as { content: Article[] };
                const articles = data.content || [];
                articles
                    .filter((a) => a.coverImage && a.status === 'PUBLISHED')
                    .forEach((a) => {
                        photoList.push({
                            id: `article-${a.id}`,
                            url: a.coverImage!,
                            description: a.location || a.title,
                            source: 'article',
                        });
                    });
            }

            (galleryMedia || []).forEach((m) => {
                photoList.push({
                    id: `media-${m.id}`,
                    url: m.url,
                    description: m.description || '',
                    source: 'media',
                    mediaId: m.id,
                });
            });

            setPhotos(photoList);
        } catch (err) {
            console.error('加载图库失败:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGallery();
    }, [loadGallery]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        handleUpload(Array.from(files));
        e.target.value = '';
    };

    const handleUpload = async (files: File[]) => {
        setUploading(true);
        setUploadMessage('');
        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            try {
                const result = await mediaService.uploadImage(file, 0);
                if (result) {
                    setPhotos((prev) => [
                        {
                            id: `media-${result.id}`,
                            url: result.url,
                            description: result.description || '',
                            source: 'media',
                            mediaId: result.id,
                        },
                        ...prev,
                    ]);
                    successCount++;
                }
            } catch (err) {
                console.error('上传失败:', err);
                failCount++;
            }
        }

        setUploadMessage(
            `成功上传 ${successCount} 张${failCount > 0 ? `，${failCount} 张失败` : ''}`
        );
        setTimeout(() => setUploadMessage(''), 3000);
        setUploading(false);
    };

    /**
     * 删除图库照片
     */
    const handleDelete = async (photo: PhotoItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!photo.mediaId || deleting) return;
        try {
            setDeleting(photo.id);
            await mediaService.deleteMedia(photo.mediaId);
            setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
            if (selectedPhoto?.id === photo.id) {
                setSelectedPhoto(null);
            }
        } catch (err) {
            console.error('删除照片失败:', err);
        } finally {
            setDeleting(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith('image/')
        );
        if (files.length > 0) handleUpload(files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const filteredPhotos = searchQuery
        ? photos.filter((p) => p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        : photos;

    return (
        <div>
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    📸 旅行相册
                </h1>
                <p className="text-gray-500">
                    记录每一次旅途中的美好瞬间（{photos.length} 张照片）
                </p>
            </motion.div>

            {/* 工具栏 */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white rounded-2xl p-3 shadow-sm">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜索照片..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm
                                 outline-none border-2 border-transparent focus:border-pink-200"
                    />
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white
                             transition-all disabled:opacity-50"
                    style={{
                        background: 'linear-gradient(135deg, #F472B6, #FB923C)',
                    }}
                >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    上传照片
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            </div>

            {uploadMessage && (
                <motion.div
                    className="mb-4 text-center text-sm text-green-500 bg-green-50 rounded-xl py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {uploadMessage}
                </motion.div>
            )}

            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 size={36} className="animate-spin text-gray-400" />
                </div>
            )}

            {!loading && filteredPhotos.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>还没有照片</p>
                    <p className="text-sm mt-1">发布带封面图的文章或直接上传照片吧</p>
                </div>
            )}

            {!loading && filteredPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredPhotos.map((photo, index) => (
                        <motion.div
                            key={photo.id}
                            className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-square"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.03, zIndex: 10 }}
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <img
                                src={photo.url}
                                alt={photo.description || '旅行照片'}
                                className="w-full h-full object-cover transition-transform duration-500
                                         group-hover:scale-110"
                                loading="lazy"
                            />
                            {/* 悬停遮罩 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            {/* 删除按钮（仅独立上传的照片可删除） */}
                            {photo.source === 'media' && photo.mediaId && (
                                <button
                                    onClick={(e) => handleDelete(photo, e)}
                                    disabled={deleting === photo.id}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 text-white
                                             opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600
                                             disabled:opacity-50"
                                >
                                    {deleting === photo.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                </button>
                            )}
                            {/* 底部信息 */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white
                                          translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                {photo.description && (
                                    <div className="text-sm font-medium truncate">{photo.description}</div>
                                )}
                                <div className="text-xs text-white/60 mt-0.5">
                                    {photo.source === 'article' ? '📝 文章封面' : '📷 相册上传'}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* 上传区域 */}
            <motion.div
                className="mt-8 flex flex-col items-center justify-center py-16 bg-white rounded-3xl
                         border-2 border-dashed border-gray-200 cursor-pointer hover:border-pink-200
                         transition-all"
                whileHover={{ scale: 1.02 }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {uploading ? (
                    <div className="text-center">
                        <Loader2 size={48} className="text-pink-400 mx-auto mb-3 animate-spin" />
                        <p className="text-gray-400">正在上传...</p>
                    </div>
                ) : (
                    <>
                        <ImageIcon size={48} className="text-gray-300 mb-3" />
                        <p className="text-gray-400 mb-1">拖拽照片到此处上传</p>
                        <p className="text-xs text-gray-300">或点击选择文件 · 支持 JPG/PNG</p>
                    </>
                )}
            </motion.div>

            {/* 大图预览弹窗 */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhoto(null)}
                    >
                        {/* 关闭按钮 */}
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white
                                     hover:bg-white/20 transition-colors z-10"
                        >
                            <X size={24} />
                        </button>
                        {/* 图片 */}
                        <motion.img
                            src={selectedPhoto.url}
                            alt={selectedPhoto.description || '照片预览'}
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {/* 底部信息栏 */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3
                                      bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 text-white text-sm">
                            {selectedPhoto.description && (
                                <span>📍 {selectedPhoto.description}</span>
                            )}
                            <a
                                href={selectedPhoto.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                                title="下载原图"
                            >
                                <Download size={18} />
                            </a>
                            {selectedPhoto.source === 'media' && selectedPhoto.mediaId && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(selectedPhoto, e as unknown as React.MouseEvent);
                                    }}
                                    className="p-1.5 rounded-full hover:bg-red-500/50 transition-colors"
                                    title="删除照片"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalleryPage;
