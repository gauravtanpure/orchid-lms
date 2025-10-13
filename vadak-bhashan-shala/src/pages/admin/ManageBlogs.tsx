import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { PlusCircle, Edit, Trash2, Search, Loader2 } from 'lucide-react';

// --- UI Components ---
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useToast } from "../../components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

// --- Interfaces ---
interface BlogPost {
  _id: string;
  title: { en: string; mr: string };
  excerpt: { en: string; mr: string };
  content: { en: string; mr: string };
  imageUrl: string;
  category: { en: string; mr: string };
  readTime: { en: string; mr: string };
  createdAt: string;
}

const emptyBlogPost: Omit<BlogPost, '_id' | 'createdAt'> = {
  title: { en: '', mr: '' },
  excerpt: { en: '', mr: '' },
  content: { en: '', mr: '' },
  imageUrl: '',
  category: { en: '', mr: '' },
  readTime: { en: '', mr: '' },
};

const ManageBlogs: React.FC = () => {
    const { toast } = useToast();
    // ------------------------------------------------------------------
    // FIX: Correctly destructure user, token, and rename isLoading to authLoading
    // ------------------------------------------------------------------
    const { user, token, isLoading: authLoading } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 

    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBlog, setCurrentBlog] = useState<BlogPost | Omit<BlogPost, '_id' | 'createdAt'>>(emptyBlogPost);
    const [searchTerm, setSearchTerm] = useState('');

    // Debug: Log auth state with corrected variables
    useEffect(() => {
        console.log('User State:', user);
        console.log('Auth Token:', token);
        console.log('User Role:', user?.role);
    }, [user, token]);

    // Fetch blogs
    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/blogs`);
            setBlogs(response.data);
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
            toast({
                title: "Error",
                description: "Failed to load blog posts.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
        lang: 'en' | 'mr', 
        field: keyof Omit<BlogPost, '_id' | 'createdAt'>
    ) => {
        const { value } = e.target;
        setCurrentBlog(prev => {
            const currentField = prev[field] as { [key: string]: string };
            return {
                ...prev,
                [field]: {
                    ...currentField,
                    [lang]: value,
                },
            };
        });
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentBlog(prev => ({
            ...prev,
            imageUrl: e.target.value,
        }));
    };

    const openCreateModal = () => {
        setCurrentBlog(emptyBlogPost);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (blog: BlogPost) => {
        setCurrentBlog(blog);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const deleteBlog = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;

        // ------------------------------------------------------------------
        // FIX: Use 'token' directly
        // ------------------------------------------------------------------
        if (!token) {
            toast({
                title: "Authentication Required",
                description: "Please log in to perform this action.",
                variant: "destructive",
            });
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    // FIX: Use 'token' directly
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.delete(`${API_URL}/api/blogs/${id}`, config);
            toast({ 
                title: 'Blog Deleted', 
                description: 'Blog post successfully deleted.' 
            });
            fetchBlogs();
        } catch (error: any) {
            console.error('Failed to delete blog:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            toast({
                title: "Error",
                description: `Failed to delete blog: ${errorMessage}`,
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ------------------------------------------------------------------
        // FIX: Use 'token' directly
        // ------------------------------------------------------------------
        if (!token) {
            toast({
                title: "Authentication Required",
                description: "You must be logged in to manage blogs.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    // FIX: Use 'token' directly
                    Authorization: `Bearer ${token}`,
                },
            };

            if (isEditing && '_id' in currentBlog) {
                await axios.put(
                    `${API_URL}/api/blogs/${currentBlog._id}`,
                    currentBlog,
                    config
                );
                toast({
                    title: 'Blog Updated',
                    description: 'Blog post successfully updated.',
                });
            } else {
                await axios.post(
                    `${API_URL}/api/blogs`,
                    currentBlog,
                    config
                );
                toast({
                    title: 'Blog Created',
                    description: 'New blog post successfully created.',
                });
            }

            fetchBlogs();
            setIsModalOpen(false);
            setCurrentBlog(emptyBlogPost);
        } catch (error: any) {
            console.error('Failed to save blog:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            toast({
                title: "Error",
                description: `Failed to save blog: ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredBlogs = useMemo(() => {
        return blogs.filter(blog =>
            blog.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.title.mr.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [blogs, searchTerm]);

    // Show loader if auth is not loaded
    // ------------------------------------------------------------------
    // FIX: Use 'user' (which is null if not logged in) for the check
    // ------------------------------------------------------------------
    if (authLoading || (!user && loading)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* --- Header --- */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
                <Button onClick={openCreateModal} className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Blog
                </Button>
            </div>

            {/* --- Search --- */}
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by English or Marathi title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* --- Blogs Table --- */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Thumbnail</TableHead>
                            <TableHead>English Title</TableHead>
                            <TableHead>Marathi Title</TableHead>
                            <TableHead>Category (EN)</TableHead>
                            <TableHead>Read Time (EN)</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-center w-[150px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBlogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No blog posts found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBlogs.map((blog) => (
                                <TableRow key={blog._id}>
                                    <TableCell>
                                        <img 
                                            src={blog.imageUrl} 
                                            alt={blog.title.en} 
                                            className="w-16 h-10 object-cover rounded" 
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium max-w-xs truncate">{blog.title.en}</TableCell>
                                    <TableCell className="max-w-xs truncate">{blog.title.mr}</TableCell>
                                    <TableCell>{blog.category.en}</TableCell>
                                    <TableCell>{blog.readTime.en}</TableCell>
                                    <TableCell>{format(new Date(blog.createdAt), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(blog)}>
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteBlog(blog._id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* --- Edit/Create Dialog --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        {/* Title - English */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Title (English)</span>
                            <Input
                                value={(currentBlog.title as { en: string; mr: string }).en}
                                onChange={(e) => handleInputChange(e, 'en', 'title')}
                                placeholder="Enter blog title in English"
                                required
                            />
                        </label>
                        {/* Title - Marathi */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Title (Marathi)</span>
                            <Input
                                value={(currentBlog.title as { en: string; mr: string }).mr}
                                onChange={(e) => handleInputChange(e, 'mr', 'title')}
                                placeholder="Enter blog title in Marathi"
                                required
                            />
                        </label>

                        {/* Excerpt - English */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Excerpt (English)</span>
                            <Textarea
                                value={(currentBlog.excerpt as { en: string; mr: string }).en}
                                onChange={(e) => handleInputChange(e, 'en', 'excerpt')}
                                placeholder="Short description in English"
                                required
                            />
                        </label>
                        {/* Excerpt - Marathi */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Excerpt (Marathi)</span>
                            <Textarea
                                value={(currentBlog.excerpt as { en: string; mr: string }).mr}
                                onChange={(e) => handleInputChange(e, 'mr', 'excerpt')}
                                placeholder="Short description in Marathi"
                                required
                            />
                        </label>

                        {/* Content - English */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Content (English)</span>
                            <Textarea
                                value={(currentBlog.content as { en: string; mr: string }).en}
                                onChange={(e) => handleInputChange(e, 'en', 'content')}
                                placeholder="Full content in English (Markdown supported)"
                                required
                                rows={8}
                            />
                        </label>
                        {/* Content - Marathi */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Content (Marathi)</span>
                            <Textarea
                                value={(currentBlog.content as { en: string; mr: string }).mr}
                                onChange={(e) => handleInputChange(e, 'mr', 'content')}
                                placeholder="Full content in Marathi (Markdown supported)"
                                required
                                rows={8}
                            />
                        </label>

                        {/* Image URL */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Image URL</span>
                            <Input
                                type="url"
                                value={currentBlog.imageUrl}
                                onChange={handleImageUrlChange}
                                placeholder="URL for the blog post main image"
                                required
                            />
                        </label>

                        {/* Category (English) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Category (English)</span>
                            <Input
                                value={(currentBlog.category as { en: string; mr: string }).en}
                                onChange={(e) => handleInputChange(e, 'en', 'category')}
                                placeholder="e.g., Finance, Education"
                                required
                            />
                        </label>
                        {/* Category (Marathi) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Category (Marathi)</span>
                            <Input
                                value={(currentBlog.category as { en: string; mr: string }).mr}
                                onChange={(e) => handleInputChange(e, 'mr', 'category')}
                                placeholder="उदा. अर्थ, शिक्षण"
                                required
                            />
                        </label>
                        
                        {/* Read Time (English) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Read Time (English)</span>
                            <Input
                                value={(currentBlog.readTime as { en: string; mr: string }).en}
                                onChange={(e) => handleInputChange(e, 'en', 'readTime')}
                                placeholder="e.g., 5 min read"
                                required
                            />
                        </label>
                        {/* Read Time (Marathi) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Read Time (Marathi)</span>
                            <Input
                                value={(currentBlog.readTime as { en: string; mr: string }).mr}
                                onChange={(e) => handleInputChange(e, 'mr', 'readTime')}
                                placeholder="उदा. ५ मिनिटे वाचन"
                                required
                            />
                        </label>

                        <DialogFooter className='mt-4'>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? 'Save Changes' : 'Create Post'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageBlogs;