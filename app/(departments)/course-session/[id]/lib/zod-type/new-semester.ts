import * as z from 'zod'

export const newSemesterSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long").max(15, "Name must be at most 15 characters long").nonempty("Name is required"),
    semesterNumber: z.number().min(1, "Semester number must be at least 1").max(8, "Semester number must be at most 8")
})

export type NewSemesterType = z.infer<typeof newSemesterSchema>