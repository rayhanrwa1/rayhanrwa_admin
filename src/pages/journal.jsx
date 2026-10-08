import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Loader2, Plus, ArrowLeft, Save } from "lucide-react";
import TipTapEditor from '../components/TipTapEditor';
import Layout from '../components/layout';

export default function Journal() {
    const [journal, setJournal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        slug: "", is_active: true, title_en: "", title_id: "", date: "",
        excerpt_en: "", excerpt_id: "", content_en: "", content_id: "",
        link: "", authors: "", publisher: "", tags: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchJournal();
    }, []);

    const fetchJournal = async () => {
        setLoading(true);
        try {
            const res = await api.get('/journal');
            const data = res.data?.data || res.data;
            setJournal(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching journal:", error);
            setJournal([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({
            slug: "", is_active: true, title_en: "", title_id: "", date: "",
            excerpt_en: "", excerpt_id: "", content_en: "", content_id: "",
            link: "", authors: "", publisher: "", tags: ""
        });
        setCurrentItem(null);
        setIsEditing(true);
    };

    const handleEdit = (item) => {
        setFormData({
            slug: item.slug || "",
            is_active: item.is_active !== false,
            title_en: item.title_en || "",
            title_id: item.title_id || "",
            date: item.date || "",
            excerpt_en: item.excerpt_en || "",
            excerpt_id: item.excerpt_id || "",
            content_en: item.content_en || "",
            content_id: item.content_id || "",
            link: item.link || "",
            authors: item.authors || "",
            publisher: item.publisher || "",
            tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || "")
        });
        setCurrentItem(item);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to move this to trash?")) return;
        try {
            await api.delete(`/journal/${id}`);
            fetchJournal();
        } catch (error) {
            alert("Error deleting: " + error.message);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const tagsArray = typeof formData.tags === 'string' 
            ? formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
            : formData.tags;

        const dataToSave = {
            slug: formData.slug,
            is_active: formData.is_active,
            title_en: formData.title_en,
            title_id: formData.title_id,
            date: formData.date,
            excerpt_en: formData.excerpt_en,
            excerpt_id: formData.excerpt_id,
            content_en: formData.content_en,
            content_id: formData.content_id,
            link: formData.link,
            authors: formData.authors,
            publisher: formData.publisher,
            tags: tagsArray
        };

        try {
            if (currentItem) {
                await api.put(`/journal/${currentItem.id || currentItem._id}`, dataToSave);
            } else {
                await api.post('/journal', dataToSave);
            }
            setIsEditing(false);
            fetchJournal();
        } catch (error) {
            alert("Error saving: " + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-900" /></div>
            </Layout>
        );
    }

    if (isEditing) {
        return (
            <Layout>
                <div className="max-w-6xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsEditing(false)} className="p-2 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 transition-colors cursor-pointer">
                                <ArrowLeft className="w-4 h-4 text-zinc-600" />
                            </button>
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{currentItem ? "Edit Entry" : "Add New Entry"}</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Publishing..." : "Publish"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Main Content Area */}
                        <div className="xl:col-span-3 space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[13px] font-semibold text-zinc-700 mb-2">Title (English)</label>
                                        <input type="text" required value={formData.title_en} onChange={e => setFormData({ ...formData, title_en: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium" placeholder="Enter title here" />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-semibold text-zinc-700 mb-2">Title (Indonesian)</label>
                                        <input type="text" required value={formData.title_id} onChange={e => setFormData({ ...formData, title_id: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium" placeholder="Masukkan judul di sini" />
                                    </div>
                                    <div className="pt-4 border-t border-zinc-100" data-color-mode="light">
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-[13px] font-semibold text-zinc-700">Content (English)</label>
                                        </div>
                                        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                                            <TipTapEditor value={formData.content_en} onChange={val => {
                                                setFormData({...formData, content_en: val || ''});
                                            }} />
                                        </div>
                                    </div>
                                    <div data-color-mode="light" className="mt-6">
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-[13px] font-semibold text-zinc-700">Content (Indonesian)</label>
                                        </div>
                                        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                                            <TipTapEditor value={formData.content_id} onChange={val => {
                                                setFormData({...formData, content_id: val || ''});
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                                <h2 className="text-[14px] font-semibold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Excerpts</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-600 mb-2">Excerpt (English)</label>
                                        <textarea value={formData.excerpt_en} onChange={e => setFormData({ ...formData, excerpt_en: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-24" />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-600 mb-2">Excerpt (Indonesian)</label>
                                        <textarea value={formData.excerpt_id} onChange={e => setFormData({ ...formData, excerpt_id: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-24" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Meta Box Area */}
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                                <h2 className="text-[13px] font-semibold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Publish</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                        <span className="text-[13px] font-medium text-zinc-700">Status</span>
                                        <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                                            <input type="checkbox" className="sr-only peer" checked={formData.is_active} readOnly />
                                            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-600 mb-1.5">Date</label>
                                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="YYYY-MM-DD" />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-600 mb-1.5">Slug (URL)</label>
                                        <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="my-first-post" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                                <h2 className="text-[13px] font-semibold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Attributes</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-600 mb-1.5">Authors</label>
                                        <input type="text" value={formData.authors} onChange={e => setFormData({ ...formData, authors: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-600 mb-1.5">Publisher</label>
                                        <input type="text" value={formData.publisher} onChange={e => setFormData({ ...formData, publisher: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-zinc-600 mb-1.5">External Link</label>
                                        <input type="url" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="https://..." />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                                <h2 className="text-[13px] font-semibold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Tags</h2>
                                <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Tech, Research" />
                                <p className="text-[11px] text-zinc-500 mt-2">Separate tags with commas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Journal Posts</h1>
                    <button onClick={handleAdd} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer">
                        <Plus className="w-4 h-4" /> Add New Post
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-zinc-200 px-4 py-3 bg-zinc-50/50 gap-4">
                        <span className="text-[13px] font-medium text-zinc-900 border-b-2 border-zinc-900 pb-3 -mb-3">All ({journal.length})</span>
                        <span className="text-[13px] font-medium text-blue-600 pb-3 -mb-3 cursor-pointer">Published ({journal.filter(j => j.is_active !== false).length})</span>
                        <span className="text-[13px] font-medium text-zinc-500 pb-3 -mb-3 cursor-pointer">Drafts ({journal.filter(j => j.is_active === false).length})</span>
                    </div>
                    {journal.length === 0 ? (
                        <div className="p-8 text-center text-sm text-zinc-500">No journal posts found.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 text-[12px] text-zinc-500 font-semibold uppercase tracking-wider bg-white">
                                    <th className="p-4">Title</th>
                                    <th className="p-4 w-32">Status</th>
                                    <th className="p-4 w-32">Date</th>
                                    <th className="p-4 w-48">Tags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-[14px]">
                                {journal.map((item) => (
                                    <tr key={item.id || item._id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="p-4 font-semibold text-zinc-900">
                                            <div className="flex flex-col">
                                                <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => handleEdit(item)}>{item.title_en || 'Untitled'}</span>
                                                <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[12px] font-normal">
                                                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 cursor-pointer">Edit</button>
                                                    <span className="text-zinc-300">|</span>
                                                    <button onClick={() => handleDelete(item.id || item._id)} className="text-red-600 hover:text-red-800 cursor-pointer">Trash</button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <span className={`px-2 py-1 text-[11px] rounded font-medium ${item.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                                                {item.is_active !== false ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-zinc-600 align-top text-[13px]">{item.date || '—'}</td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(item.tags) && item.tags.map((tag, i) => (
                                                    <span key={i} className="text-zinc-500 text-[13px]">{tag}{i < item.tags.length - 1 ? ',' : ''}</span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Layout>
    );
}
