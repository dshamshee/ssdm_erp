import { fetchCoursesByDepartment } from "./lib/action"

export default async function DepartmentByIdPage(){

    const result = await fetchCoursesByDepartment("1")
    console.log(result)

    return(
        <>
        <h1>Department By Id Page</h1>
        </>
    )
}