import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { newSemesterSchema, NewSemesterType } from "../lib/zod-type/new-semester"
import { zodResolver } from "@hookform/resolvers/zod"
import { InputForSemester } from "./input-for-semester"

export const AddSemester = () => {

    const form = useForm<NewSemesterType>({
        resolver: zodResolver(newSemesterSchema),
        defaultValues: {
            name: "",
            semesterNumber: 1
        }
    })

    const onSubmit = (data: NewSemesterType) => {
        console.log(data)
    }

    return (

        <Dialog>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">New Semester</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>New Semester</DialogTitle>
                        <DialogDescription>
                            Add a new semester to the course session.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col justify-center items-center gap-2 mt-5">
                        <InputForSemester form={form} />
                    </div>

                    <DialogFooter className="mt-5">
                        <DialogClose asChild>
                            <Button variant="outline" className="cursor-pointer">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" className="cursor-pointer ">Submit</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    )
}