import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { mediaService, type MediaItem } from '../services/mediaService';
import { formatDate } from '../utils/validation';

/**
 * 相册页面
 */
const GalleryPage = () => {
    const [photos, setPhotos] = useState<MediaItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * 加载图库照片（当前暂用模拟数据，后续可对接文章媒体列表）
     */
    const loadPhotos = () => {
        // 图库照片需要关联到文章，后续可扩展独立的媒体图库 API
        // 当前保留模拟数据作为展示
        if (photos.length === 0) {
            setPhotos([
                { id: 1, url: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=400', type: 'IMAGE', description: '日本·小樽' },
                { id: 2, url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', type: 'IMAGE', description: '巴厘岛' },
                { id: 3, url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400', type: 'IMAGE', description: '云南·丽江' },
                { id: 4, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', type: 'IMAGE', description: '垦丁' },
                { id: 5, url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', type: 'IMAGE', description: '京都·岚山' },
                { id: 6, url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400', type: 'IMAGE', description: '敦煌' },
                { id: 7, url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400', type: 'IMAGE', description: '日本·北海道' },
                { id: 8, url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400', type: 'IMAGE', description: '泰国·清迈' },
                { id: 9, url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400', type: 'IMAGE', description: '新西兰' },
                { id: 10, url: 'https://images.unsplash.com/photo-1476514525535-07fb3b10dd5e?w=400', type: 'IMAGE', description: '挪威' },
                { id: 11, url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400', type: 'IMAGE', description: '冰岛' },
                { id: 12, url: 'https://images.unsplash.com/photo-1502602898657-3e91760e8f3b?w=400', type: 'IMAGE', description: '法国·巴黎' },
            ]);
        }
    };

    // 首次加载
    if (photos.length === 0 && !loading) {
        loadPhotos();
    }

    /**
     * 文件选择处理
     */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        handleUpload(Array.from(files));
        // 重置 input 以便重复选择同一文件
        e.target.value = '';
    };

    /**
     * 上传图片
     */
    const handleUpload = async (files: File[]) => {
        setUploading(true);
        setUploadMessage('');
        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            try {
                // 上传到默认文章(articleId=0 表示独立图库照片)
                const result = await mediaService.uploadImage(file, 0);
                if (result) {
                    setPhotos((prev) => [result, ...prev]);
                    successCount++;
                }
            } catch (err) {
                console.error('上传失败:', err);
                failCount++;
            }
        }

        if (successCount > 0 || failCount > 0) {
            setUploadMessage(
                `成功上传 ${successCount} 张${failCount > 0 ? `，${failCount} 张失败` : ''}`
            );
            setTimeout(() => setUploadMessage(''), 3000);
        }
        setUploading(false);
    };

    /**
     * 拖拽上传处理
     */
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith('image/')
        );
        if (files.length > 0) {
            handleUpload(files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const filteredPhotos = searchQuery
        ? photos.filter((p) => p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        : photos;

    return (
        <div>
            {/* 页面头部 */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    📸 旅行相册
                </h1>
                <p className="text-gray-500">记录每一次旅途中的美好瞬间</p>
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
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50
                                   text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                        <Filter size={14} /> 筛选
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50
                                   text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                        <Grid size={14} /> 布局
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white
                                 transition-all disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #F472B6, #FB923C)',
                        }}
                    >
                        {uploading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Upload size={14} />
                        )}
                        上传
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>

            {/* 上传消息 */}
            {uploadMessage && (
                <motion.div
                    className="mb-4 text-center text-sm text-green-500 bg-green-50 rounded-xl py-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {uploadMessage}
                </motion.div>
            )}

            {/* 加载状态 */}
            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 size={36} className="animate-spin text-gray-400" />
                </div>
            )}

            {/* 照片网格 */}
            {!loading && filteredPhotos.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>还没有照片</p>
                    <p className="text-sm mt-1">上传你的第一张旅行照片吧</p>
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
                            whileHover={{ scale: 1.05, zIndex: 10 }}
                        >
                            <img
                                src={photo.url}
                                alt={photo.description || '旅行照片'}
                                className="w-full h-full object-cover transition-transform duration-500
                                         group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white
                                          translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                {photo.description && (
                                    <div className="text-sm font-medium">📍 {photo.description}</div>
                                )}
                                <div className="text-xs text-white/70">{photo.type}</div>
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
        </div>
    );
};

export default GalleryPage;
