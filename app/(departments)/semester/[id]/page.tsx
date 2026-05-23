import { fetchSemesterById } from "./lib/action"

export default async function SemesterByIdPage(){

    const result = await fetchSemesterById("1")
    console.log(result)

    return(
        <>
        <h1>Semester by ID page</h1>
        </>
    )
}