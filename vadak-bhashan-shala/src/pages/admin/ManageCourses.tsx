// /frontend/src/pages/admin/ManageCourses.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, UploadCloud, Eye, Loader2, XCircle, FileVideo, Tag, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/components/ui/use-toast"; 
import { Course } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// NOTE: Verify the path for Tabs is correct in your project!
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { Textarea } from '@/components/ui/textarea'; // Assuming you have a Textarea component

// Define a type for the video items in the form
interface CourseVideo {
    title: string;
    file: File;
}

// API functions
const fetchCourses = async (): Promise<Course[]> => {
  const { data } = await axios.get('http://localhost:1337/api/courses');
  return data;
};

const addCourse = async (formData: FormData) => {
  // Now calls the unified POST / route
  const { data } = await axios.post('http://localhost:1337/api/courses', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

const ManageCourses: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // State to control tab navigation
  
  // State for the new course data
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    description: '', // Added description field
    instructor: '',
    price: 0,
    duration: 0,
    category: 'english',
    specialOffer: {
      isActive: false,
      discountType: 'percentage',
      discountValue: 0,
      description: ''
    }
  });

  // State for files
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // Array to hold multiple video files with their titles
  const [courseVideos, setCourseVideos] = useState<CourseVideo[]>([]);
  
  // To temporarily hold the title and file for the video currently being added
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null);


  // Fetch all courses
  const { data: courses = [], isLoading, isError } = useQuery<Course[]>({
    queryKey: ['adminCourses'],
    queryFn: fetchCourses,
  });

  // Mutation for adding a course
  const addCourseMutation = useMutation({
    mutationFn: addCourse,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'New course added successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      setIsDialogOpen(false); 
      // Reset all states
      setNewCourse({
        title: '',
        description: '',
        instructor: '',
        price: 0,
        duration: 0,
        category: 'english',
        specialOffer: {
          isActive: false,
          discountType: 'percentage',
          discountValue: 0,
          description: ''
        }
      });
      setThumbnailFile(null);
      setCourseVideos([]); 
      setCurrentVideoTitle('');
      setCurrentVideoFile(null);
      setActiveTab('basic'); // Reset to first tab
    },
    onError: (error: any) => {
      console.error('Add course error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add course. Check server logs.',
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setNewCourse(prev => ({
        ...prev,
        [id]: value
    }));
  };

  const handleSpecialOfferChange = (key: keyof (typeof newCourse.specialOffer), value: any) => {
    setNewCourse(prev => ({
      ...prev,
      specialOffer: {
        ...prev.specialOffer!,
        [key]: value
      }
    }));
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setThumbnailFile(file);
  };
  
  const handleCurrentVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setCurrentVideoFile(file);
  };

  const handleAddVideo = () => {
    if (currentVideoTitle.trim() && currentVideoFile) {
        setCourseVideos(prev => [
            ...prev,
            { title: currentVideoTitle.trim(), file: currentVideoFile }
        ]);
        setCurrentVideoTitle('');
        setCurrentVideoFile(null);
        // Reset the file input visually to allow adding the same file name twice if needed
        const fileInput = document.getElementById('currentVideoFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    } else {
        toast({
            title: 'Missing Video Data',
            description: 'Please provide both a title and a file for the video.',
            variant: 'destructive',
        });
    }
  };

  const handleRemoveVideo = (indexToRemove: number) => {
    setCourseVideos(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  // =================================================================
  //  ⬇️ *** THIS IS THE CORRECTED FUNCTION *** ⬇️
  // =================================================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- FINAL VALIDATION (This part is fine) ---
    if (!newCourse.title || !newCourse.instructor) {
        toast({ title: 'Validation Error', description: 'Please complete the Title and Instructor fields in the Basic Info tab.', variant: 'destructive' });
        setActiveTab('basic');
        return;
    }
    if (!thumbnailFile || courseVideos.length === 0) { 
        toast({ title: 'Validation Error', description: 'Please add a thumbnail image and at least one course video.', variant: 'destructive' });
        setActiveTab('media');
        return;
    }

    const formData = new FormData();
    formData.append('title', newCourse.title || '');
    formData.append('instructor', newCourse.instructor || '');
    formData.append('price', (newCourse.price || 0).toString());
    formData.append('duration', (newCourse.duration || 0).toString()); // We will use this as a fallback
    formData.append('category', newCourse.category || 'english');
    formData.append('description', newCourse.description || ''); 
    
    // Special Offer fields
    const specialOffer = newCourse.specialOffer!;
    formData.append('specialOffer[isActive]', specialOffer.isActive.toString());
    if (specialOffer.isActive) {
        formData.append('specialOffer[discountType]', specialOffer.discountType);
        formData.append('specialOffer[discountValue]', specialOffer.discountValue.toString());
        formData.append('specialOffer[description]', specialOffer.description);
    }

    // Append thumbnail (This is correct)
    formData.append('thumbnail', thumbnailFile);
    
    // --- ⬇️ THIS IS THE MODIFIED PART ⬇️ ---
    // Append multiple videos and their titles in a flat structure
    courseVideos.forEach((video) => {
        // Append each file to the 'videoFiles' field
        formData.append('videoFiles', video.file); 
        // Append each corresponding title to the 'videoTitles' field
        formData.append('videoTitles', video.title);
    });
    // --- ⬆️ END OF MODIFIED PART ⬆️ ---

    addCourseMutation.mutate(formData);
  };
  // =================================================================
  //  ⬆️ *** END OF CORRECTED FUNCTION *** ⬆️
  // =================================================================


  const handleViewDetails = (id: string) => {
    toast({
        title: "Feature Unavailable",
        description: `Viewing details for course ID: ${id} is not yet implemented.`,
        variant: "default"
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold">Manage Courses</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Course
                </Button>
              </DialogTrigger>
              {/* Removed max-height/overflow from DialogContent to rely on browser scroll */}
              <DialogContent className="w-full max-w-[90vw] sm:max-w-[700px]"> 
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new course to the platform.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic"><Info className="h-4 w-4 mr-2"/> Basic Info</TabsTrigger>
                            <TabsTrigger value="media"><FileVideo className="h-4 w-4 mr-2"/> Media</TabsTrigger>
                            <TabsTrigger value="offer"><Tag className="h-4 w-4 mr-2"/> Special Offer</TabsTrigger>
                        </TabsList>

                        {/* =======================================================
                            TAB 1: BASIC INFO 
                        ======================================================= */}
                        <TabsContent value="basic" className="py-2 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> 
                                <div className="space-y-2 col-span-full sm:col-span-3">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" value={newCourse.title} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2 col-span-full sm:col-span-3">
                                    <Label htmlFor="instructor">Instructor</Label>
                                    <Input id="instructor" value={newCourse.instructor} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2 col-span-full sm:col-span-3">
                                    <Label htmlFor="description">Description</Label>
                                    {/* Using Textarea for longer description */}
                                    <Textarea 
                                        id="description" 
                                        value={newCourse.description} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter a brief course description..." 
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₹)</Label>
                                    <Input id="price" type="number" value={newCourse.price} onChange={handleInputChange} required min="0" step="0.01" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (Hours)</Label>
                                    {/* NOTE: This duration field is for display/initial estimate. The backend calculates the final total from videos. */}
                                    <Input id="duration" type="number" value={newCourse.duration} onChange={handleInputChange} required min="1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={newCourse.category} onValueChange={(val) => handleSelectChange('category', val)}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="marathi">Marathi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="button" onClick={() => setActiveTab('media')}>Next: Media & Videos</Button>
                        </TabsContent>

                        {/* =======================================================
                            TAB 2: VIDEOS & MEDIA
                        ======================================================= */}
                        <TabsContent value="media" className="py-2 space-y-4">
                            {/* Thumbnail Upload */}
                            <div className="space-y-2 border p-4 rounded-lg">
                                <Label htmlFor="thumbnailFile" className="font-semibold">Thumbnail Image (Required)</Label>
                                <Input 
                                    id="thumbnailFile" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleThumbnailFileChange} 
                                    required 
                                    // Use a key to force re-render/reset if needed
                                    key={thumbnailFile ? thumbnailFile.name : 'no-thumb'}
                                />
                                {thumbnailFile && <p className="text-xs text-muted-foreground">Selected: {thumbnailFile.name}</p>}
                                {!thumbnailFile && <p className="text-sm text-red-500">Thumbnail is required.</p>}
                            </div>

                            {/* Multiple Video Upload Section */}
                            <div className="border p-4 rounded-lg space-y-4">
                                <h3 className="text-lg font-semibold border-b pb-2">Course Videos</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2 items-end">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentVideoTitle">Video Title</Label>
                                        <Input 
                                            id="currentVideoTitle" 
                                            value={currentVideoTitle} 
                                            onChange={(e) => setCurrentVideoTitle(e.target.value)} 
                                            placeholder="e.g., Introduction"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="currentVideoFile">Video File</Label>
                                        <Input 
                                            id="currentVideoFile" 
                                            type="file" 
                                            accept="video/*" 
                                            onChange={handleCurrentVideoFileChange} 
                                            // KEY ensures the input clears when we hit Add Video (which resets currentVideoFile state)
                                            key={currentVideoFile ? currentVideoFile.name + Math.random().toString() : 'no-file'} 
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        onClick={handleAddVideo} 
                                        disabled={!currentVideoTitle.trim() || !currentVideoFile}
                                        className='w-full md:w-auto md:col-span-1 mt-2 md:mt-0'
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Video
                                    </Button>
                                </div>

                                {/* List of added videos - scrollable area */}
                                {courseVideos.length > 0 && (
                                    <div className='space-y-2 mt-4'>
                                        <p className="text-sm font-medium">Added Videos:</p>
                                        <div className="space-y-1 max-h-40 overflow-y-auto border p-2 rounded-md">
                                            {courseVideos.map((video, index) => (
                                                <div key={index} className='flex justify-between items-center p-2 border rounded-md bg-gray-50 dark:bg-gray-800'>
                                                    <span className='text-sm truncate mr-4'>
                                                        <span className='font-semibold'>{video.title}</span> ({video.file.name})
                                                    </span>
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleRemoveVideo(index)}
                                                    >
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {courseVideos.length === 0 && (
                                    <p className="text-sm text-red-500 mt-2">Please add at least one video to the course.</p>
                                )}
                            </div>
                            <Button type="button" onClick={() => setActiveTab('offer')}>Next: Special Offer</Button>
                        </TabsContent>

                        {/* =======================================================
                            TAB 3: SPECIAL OFFER 
                        ======================================================= */}
                        <TabsContent value="offer" className="py-2 space-y-4">
                            <div className="border p-4 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="specialOfferToggle" className="text-base font-semibold">Activate Special Offer</Label>
                                    <Switch 
                                        id="specialOfferToggle"
                                        checked={newCourse.specialOffer?.isActive} 
                                        onCheckedChange={(checked) => handleSpecialOfferChange('isActive', checked)}
                                    />
                                </div>
                                {newCourse.specialOffer?.isActive && (
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'> 
                                        <div className="space-y-2">
                                            <Label htmlFor="discountType">Discount Type</Label>
                                            <Select 
                                                value={newCourse.specialOffer.discountType} 
                                                onValueChange={(val) => handleSpecialOfferChange('discountType', val as 'percentage' | 'fixed')}
                                            >
                                                <SelectTrigger id="discountType">
                                                    <SelectValue placeholder="Select Discount Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="discountValue">Discount Value</Label>
                                            <Input 
                                                id="discountValue" 
                                                type="number" 
                                                value={newCourse.specialOffer.discountValue} 
                                                onChange={(e) => handleSpecialOfferChange('discountValue', parseFloat(e.target.value))}
                                                required 
                                                min="0" 
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-full">
                                            <Label htmlFor="description">Offer Description</Label>
                                            <Input 
                                                id="description" 
                                                value={newCourse.specialOffer.description} 
                                                onChange={(e) => handleSpecialOfferChange('description', e.target.value)}
                                                placeholder="e.g., 'Limited Time Offer'"
                                                required 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button type="button" onClick={() => setActiveTab('media')}>Back to Media</Button>
                        </TabsContent>
                    </Tabs>


                  <DialogFooter>
                    <Button type="submit" disabled={addCourseMutation.isPending || courseVideos.length === 0}>
                      {addCourseMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UploadCloud className="mr-2 h-4 w-4" />
                      )}
                      Add Course
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Course Listing Table */}
          <div className="overflow-x-auto"> 
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : isError || courses.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-red-500">Failed to load courses.</TableCell></TableRow>
                  ) : (
                    courses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{course.title}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell className="font-semibold">₹{course.price.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{course.enrollments}</TableCell>
                        <TableCell>
                            <Progress value={course.completionRate} className="h-2 mb-1" />
                            <span className="text-xs text-muted-foreground">{course.completionRate}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(course._id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCourses;