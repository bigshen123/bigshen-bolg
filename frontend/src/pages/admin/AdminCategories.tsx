import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Loader2, Plus } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import Button from '../../components/common/Button';
import type { Category } from '../../types/article';

/**
 * 分类管理页
 */
const AdminCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Category | null>(null);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ name: '', description: '' });

    useEffect(() => {
        categoryService.getAllCategories().then(setCategories).catch(console.error).finally(() => setLoading(false));
    }, []);

    const resetForm = () => {
        setForm({ name: '', description: '' });
        setEditing(null);
        setAdding(false);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        try {
            if (editing) {
                const updated = await categoryService.updateCategory(editing.id, form);
                setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            } else {
                const created = await categoryService.createCategory(form);
                setCategories((prev) => [...prev, created]);
            }
            resetForm();
        } catch (err) {
            console.error('保存分类失败:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('确定删除该分类吗？')) return;
        try {
            await categoryService.deleteCategory(id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error('删除失败:', err);
        }
    };

    const handleEdit = (cat: Category) => {
        setEditing(cat);
        setForm({ name: cat.name, description: cat.description });
        setAdding(true);
    };

    if (loading) {
        return <div className="flex justify-center py-40"><Loader2 size={36} className="animate-spin text-gray-400" /></div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📂 分类管理</h1>
                <Button
                    icon={<Plus size={16} />}
                    size="sm"
                    onClick={() => { resetForm(); setAdding(true); }}
                >
                    新增分类
                </Button>
            </div>

            {/* 表单 */}
            {adding && (
                <motion.div
                    className="bg-white rounded-2xl shadow-sm p-5 mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 className="font-semibold text-gray-700 mb-3">
                        {editing ? '编辑分类' : '新增分类'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="分类名称"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            className="p-3 bg-gray-50 rounded-xl outline-none border-2 border-transparent
                                     focus:border-pink-200 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="分类描述"
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            className="p-3 bg-gray-50 rounded-xl outline-none border-2 border-transparent
                                     focus:border-pink-200 text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} disabled={!form.name.trim()}>保存</Button>
                        <Button size="sm" variant="outline" onClick={resetForm}>取消</Button>
                    </div>
                </motion.div>
            )}

            {/* 列表 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-sm text-gray-500">
                            <th className="px-5 py-3 font-medium">名称</th>
                            <th className="px-5 py-3 font-medium">描述</th>
                            <th className="px-5 py-3 font-medium">文章数</th>
                            <th className="px-5 py-3 font-medium">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-16 text-center text-gray-400">暂无分类</td>
                            </tr>
                        ) : (
                            categories.map((c, i) => (
                                <motion.tr
                                    key={c.id}
                                    className="border-t border-gray-50 hover:bg-gray-50/50 text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                                    <td className="px-5 py-3 text-gray-500">{c.description || '-'}</td>
                                    <td className="px-5 py-3 text-gray-500">{c.articleCount}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(c)}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-pink-500">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(c.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCategories;
