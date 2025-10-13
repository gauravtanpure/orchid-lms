import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { PlusCircle, Edit, Trash2, Search, Loader2, UploadCloud } from 'lucide-react';

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
  imageUrl: string; // URL from Cloudinary
  category: { en: string; mr: string };
  readTime: { en: string; mr: string };
  createdAt: string;
}

// Separate state for file/image input
interface CurrentBlogState extends Omit<BlogPost, '_id' | 'createdAt'> {
    imageFile: File | null;
    existingImageUrl: string;
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
    // FIX: Correctly destructure user and token from useAuth
    // ------------------------------------------------------------------
    const { user, token, isLoading: authLoading } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 

    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // ⬇️ UPDATED STATE TYPE for handling file and existing URL separately
    const [currentBlog, setCurrentBlog] = useState<CurrentBlogState>({
        ...emptyBlogPost,
        imageFile: null,
        existingImageUrl: '',
    });
    
    const [searchTerm, setSearchTerm] = useState('');

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

    // Helper for structured input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
        lang: 'en' | 'mr', 
        field: 'title' | 'excerpt' | 'content' | 'category' | 'readTime'
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

    // ⬇️ NEW: Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCurrentBlog(prev => ({
                ...prev,
                imageFile: e.target.files![0],
            }));
        } else {
            setCurrentBlog(prev => ({
                ...prev,
                imageFile: null,
            }));
        }
    };

    // Open Create Modal
    const openCreateModal = () => {
        setCurrentBlog({ 
            ...emptyBlogPost,
            imageFile: null,
            existingImageUrl: '',
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (blog: BlogPost) => {
        setCurrentBlog({ 
            ...blog,
            imageFile: null, // Clear file on edit open
            existingImageUrl: blog.imageUrl, // Store current URL
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Delete Blog (Logic remains the same, but uses the corrected token)
    const deleteBlog = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;

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

    // ⬇️ MAJOR CHANGE: Handle Submit for File Upload
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast({
                title: "Authentication Required",
                description: "You must be logged in to manage blogs.",
                variant: "destructive",
            });
            return;
        }
        
        // Validation check for new posts or updates without an image
        if (!isEditing && !currentBlog.imageFile) {
            toast({
                title: "Image Required",
                description: "Please upload an image for the new blog post.",
                variant: "destructive",
            });
            return;
        }

        // Check for updates where no file is selected and no existing URL is present
        if (isEditing && !currentBlog.imageFile && !currentBlog.existingImageUrl) {
            toast({
                title: "Image Required",
                description: "Please upload an image or ensure an existing one is loaded.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        // 1. Prepare FormData for file upload
        const formData = new FormData();
        
        // Append all text fields as JSON strings
        // This is necessary because FormData treats all values as strings, 
        // and we need to reconstruct the nested object structure on the backend.
        formData.append('title', JSON.stringify(currentBlog.title));
        formData.append('excerpt', JSON.stringify(currentBlog.excerpt));
        formData.append('content', JSON.stringify(currentBlog.content));
        formData.append('category', JSON.stringify(currentBlog.category));
        formData.append('readTime', JSON.stringify(currentBlog.readTime));
        
        // 2. Append the image file if selected
        if (currentBlog.imageFile) {
            // 'image' must match the key used in multerMiddleware.js (upload.single('image'))
            formData.append('image', currentBlog.imageFile); 
        }
        
        // 3. Append existing URL for update endpoint
        if (isEditing) {
            formData.append('existingImageUrl', currentBlog.existingImageUrl);
        }


        try {
            // Note: Axios automatically sets the Content-Type to multipart/form-data 
            // when it detects a FormData object, so we only need to pass the Authorization header.
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            if (isEditing) {
                // If editing, use PUT request
                await axios.put(
                    `${API_URL}/api/blogs/${(currentBlog as BlogPost)._id}`,
                    formData, // Send FormData
                    config
                );
                toast({
                    title: 'Blog Updated',
                    description: 'Blog post successfully updated.',
                });
            } else {
                // If creating, use POST request
                await axios.post(
                    `${API_URL}/api/blogs`,
                    formData, // Send FormData
                    config
                );
                toast({
                    title: 'Blog Created',
                    description: 'New blog post successfully created.',
                });
            }

            fetchBlogs();
            setIsModalOpen(false);
            setCurrentBlog({ ...emptyBlogPost, imageFile: null, existingImageUrl: '' }); // Reset form
        } catch (error: any) {
            console.error('Failed to save blog:', error.response?.data || error);
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
    if (authLoading || (!user && loading)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* ... (Header and Search remain the same) ... */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
                <Button onClick={openCreateModal} className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Blog
                </Button>
            </div>

            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by English or Marathi title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* ... (Blogs Table remains the same) ... */}
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
                    {/* ⬇️ Form onSubmit remains, but logic is in handleSubmit */}
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        {/* Title - English (remains same) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Title (English)</span>
                            <Input
                                value={currentBlog.title.en}
                                onChange={(e) => handleInputChange(e, 'en', 'title')}
                                placeholder="Enter blog title in English"
                                required
                            />
                        </label>
                        {/* Title - Marathi (remains same) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Title (Marathi)</span>
                            <Input
                                value={currentBlog.title.mr}
                                onChange={(e) => handleInputChange(e, 'mr', 'title')}
                                placeholder="Enter blog title in Marathi"
                                required
                            />
                        </label>

                        {/* ... (Excerpt and Content inputs remain the same) ... */}
                         {/* Excerpt - English */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Excerpt (English)</span>
                            <Textarea
                                value={currentBlog.excerpt.en}
                                onChange={(e) => handleInputChange(e, 'en', 'excerpt')}
                                placeholder="Short description in English"
                                required
                            />
                        </label>
                        {/* Excerpt - Marathi */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Excerpt (Marathi)</span>
                            <Textarea
                                value={currentBlog.excerpt.mr}
                                onChange={(e) => handleInputChange(e, 'mr', 'excerpt')}
                                placeholder="Short description in Marathi"
                                required
                            />
                        </label>

                        {/* Content - English */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Content (English)</span>
                            <Textarea
                                value={currentBlog.content.en}
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
                                value={currentBlog.content.mr}
                                onChange={(e) => handleInputChange(e, 'mr', 'content')}
                                placeholder="Full content in Marathi (Markdown supported)"
                                required
                                rows={8}
                            />
                        </label>


                        {/* ⬇️ NEW: Image Upload Input */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Blog Image</span>
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="file:text-primary file:font-semibold"
                            />
                            {/* Display preview/status */}
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <UploadCloud className="h-3 w-3 mr-1" />
                                {currentBlog.imageFile 
                                    ? `File selected: ${currentBlog.imageFile.name}`
                                    : isEditing 
                                        ? currentBlog.existingImageUrl 
                                            ? `Current Image: ${currentBlog.existingImageUrl.substring(0, 50)}...`
                                            : 'No existing image. Upload new one.'
                                        : 'Choose an image file to upload (Max 50MB)'
                                }
                            </p>
                        </label>
                        {/* ⬆️ END NEW: Image Upload Input */}


                        {/* Category (English) (remains same) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Category (English)</span>
                            <Input
                                value={currentBlog.category.en}
                                onChange={(e) => handleInputChange(e, 'en', 'category')}
                                placeholder="e.g., Finance, Education"
                                required
                            />
                        </label>
                        {/* Category (Marathi) (remains same) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Category (Marathi)</span>
                            <Input
                                value={currentBlog.category.mr}
                                onChange={(e) => handleInputChange(e, 'mr', 'category')}
                                placeholder="उदा. अर्थ, शिक्षण"
                                required
                            />
                        </label>
                        
                        {/* Read Time (English) (remains same) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Read Time (English)</span>
                            <Input
                                value={currentBlog.readTime.en}
                                onChange={(e) => handleInputChange(e, 'en', 'readTime')}
                                placeholder="e.g., 5 min read"
                                required
                            />
                        </label>
                        {/* Read Time (Marathi) (remains same) */}
                        <label className="grid gap-1.5">
                            <span className="font-medium">Read Time (Marathi)</span>
                            <Input
                                value={currentBlog.readTime.mr}
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