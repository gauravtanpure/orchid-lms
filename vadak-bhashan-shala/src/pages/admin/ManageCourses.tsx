import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockAdminCourses } from '@/data/adminMockData';
import { PlusCircle, UploadCloud } from 'lucide-react';

// Define the shape of a course
interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  duration: number;
  enrollments: number;
}

const ManageCourses: React.FC = () => {
  // 1. Manage the list of courses in state to allow additions
  const [courses, setCourses] = useState<Course[]>(mockAdminCourses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 2. State for the new course form fields
  const [newCourseData, setNewCourseData] = useState({
    title: '',
    instructor: '',
    price: '',
    duration: '',
    category: 'english', // Default category
    thumbnail: null as File | null,
    video: null as File | null,
  });

  // 3. Handler to update form state on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files) {
      setNewCourseData({ ...newCourseData, [name]: files[0] });
    } else {
      setNewCourseData({ ...newCourseData, [name]: value });
    }
  };

  // 4. Handler to add the new course to the list
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: newCourseData.title,
      instructor: newCourseData.instructor,
      price: parseInt(newCourseData.price, 10) || 0,
      duration: parseInt(newCourseData.duration, 10) || 0,
      category: newCourseData.category,
      enrollments: 0, // New courses start with 0 enrollments
    };

    // Add the new course to the top of the list for immediate visibility
    setCourses([newCourse, ...courses]);
    
    // Close the dialog and reset the form
    setIsDialogOpen(false);
    setNewCourseData({
      title: '',
      instructor: '',
      price: '',
      duration: '',
      category: 'english',
      thumbnail: null,
      video: null,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        {/* --- DIALOG WRAPPER FOR THE FORM --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" name="title" value={newCourseData.title} onChange={handleInputChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="instructor" className="text-right">Instructor</Label>
                  <Input id="instructor" name="instructor" value={newCourseData.instructor} onChange={handleInputChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price (₹)</Label>
                  <Input id="price" name="price" type="number" value={newCourseData.price} onChange={handleInputChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">Duration (hrs)</Label>
                  <Input id="duration" name="duration" type="number" value={newCourseData.duration} onChange={handleInputChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="thumbnail" className="text-right">Iconic Image</Label>
                  <Input id="thumbnail" name="thumbnail" type="file" accept="image/*" onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="video" className="text-right">Course Video</Label>
                  <Input id="video" name="video" type="file" accept="video/*" onChange={handleInputChange} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  <UploadCloud className="mr-2 h-4 w-4" /> Save Course
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Now mapping over the state variable `courses` */}
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.instructor}</TableCell>
                  <TableCell>₹{course.price.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{course.enrollments}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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