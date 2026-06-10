"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useForm } from "react-hook-form";
import {
  type NewCourseType,
  newCourseSchema,
} from "../lib/zod-type/new-course-type";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputForCourse } from "./input-for-course";

export function AddCourse() {
  const form = useForm<NewCourseType>({
    resolver: zodResolver(newCourseSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      type: "UG Regular",
      duration: 4,
      // isActive: true
    },
  });

  const onSubmit = (data: NewCourseType) => {
    console.log(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"secondary"}
          className="text-blue-900 font-bold cursor-pointer shadow-lg"
        >
          New Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-semibold">Add New Course</DialogTitle>
            <DialogDescription>
              Add a new course here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-5">
            <InputForCourse form={form} />
          </div>
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer ">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
