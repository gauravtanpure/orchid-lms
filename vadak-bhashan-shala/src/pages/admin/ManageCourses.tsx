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
import { PlusCircle, UploadCloud, Eye, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/components/ui/use-toast"
import { Course } from '@/types'; // <-- IMPORT TYPE

// API functions
const fetchCourses = async (): Promise<Course[]> => {
  const { data } = await axios.get('http://localhost:5000/api/courses');
  return data;
};

const addCourse = async (formData: FormData) => {
  const { data } = await axios.post('http://localhost:5000/api/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const ManageCourses: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for the new course form fields
  const [newCourseData, setNewCourseData] = useState({
    title: '', instructor: '', price: '', duration: '', category: 'english',
    thumbnail: null as File | null,
    video: null as File | null,
  });

  // --- React Query for Data Fetching ---
  const { data: courses = [], isLoading, isError } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  // --- React Query for Data Mutation (Adding a Course) ---
  const mutation = useMutation({
    mutationFn: addCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] }); // Refetch courses after success
      toast({ title: "Success", description: "Course added successfully!" });
      setIsDialogOpen(false); // Close dialog
      // Reset form
      setNewCourseData({ title: '', instructor: '', price: '', duration: '', category: 'english', thumbnail: null, video: null });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: `Failed to add course: ${error.message}` });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files) {
      setNewCourseData({ ...newCourseData, [name]: files[0] });
    } else {
      setNewCourseData({ ...newCourseData, [name]: value });
    }
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newCourseData.title);
    formData.append('instructor', newCourseData.instructor);
    formData.append('price', newCourseData.price);
    formData.append('duration', newCourseData.duration);
    formData.append('category', newCourseData.category);
    if (newCourseData.thumbnail) formData.append('thumbnail', newCourseData.thumbnail);
    if (newCourseData.video) formData.append('video', newCourseData.video);
    
    mutation.mutate(formData);
  };

  const handleViewDetails = (courseId: string) => {
    alert(`Viewing detailed analytics and tracking for Course ID: ${courseId}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Courses & Tracking</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* ... DialogTrigger and DialogContent with the form ... */}
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new course.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourse}>
              {/* --- Form fields are the same as your original file --- */}
              <div className="grid gap-4 py-4">
                  {/* Title */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input id="title" name="title" value={newCourseData.title} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  {/* Instructor */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="instructor" className="text-right">Instructor</Label>
                      <Input id="instructor" name="instructor" value={newCourseData.instructor} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  {/* Price */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">Price (₹)</Label>
                      <Input id="price" name="price" type="number" value={newCourseData.price} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  {/* Duration */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">Duration (hrs)</Label>
                      <Input id="duration" name="duration" type="number" value={newCourseData.duration} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  {/* Thumbnail */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="thumbnail" className="text-right">Thumbnail</Label>
                      <Input id="thumbnail" name="thumbnail" type="file" accept="image/*" onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  {/* Video */}
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="video" className="text-right">Course Video</Label>
                      <Input id="video" name="video" type="file" accept="video/*" onChange={handleInputChange} className="col-span-3" required />
                  </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="mr-2 h-4 w-4" />
                  )}
                  Save Course
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {/* ... TableHeader is the same ... */}
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead className="w-[150px]">Completion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" />
                      </TableCell>
                  </TableRow>
              )}
              {isError && (
                  <TableRow><TableCell colSpan={6} className="text-center text-red-500">Failed to load courses.</TableCell></TableRow>
              )}
              {!isLoading && !isError && courses.map((course) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCourses;