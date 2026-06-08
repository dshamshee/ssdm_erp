'use client'
import { useQuery } from "@tanstack/react-query"
import { getEnrolledStudent } from "../query/get-enrolled-student"
import { PersonalDetailsForm } from "./personal-details-form"
import { PreviousAcademicDetailsForm } from "./previous-academic-details-form"
import { DocumentsUploadForm } from "./documents-upload-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  studentDataZodSchema,
  StudentDataType,
  academicDetailsZodSchema,
  AcademicDetailsType,
  documentsUploadZodSchema,
  DocumentsUploadType,
} from '../lib/zod-type/student-data'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import axios from "axios"

export const StudentRegistration = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isUploaded, setIsUploaded] = useState<boolean>(false)

  const onUpload = async () => {
    setIsUploading(true)
    try {
      // 1. Validate the documents form first to ensure correct selections/size checks pass
      const isDocumentsValid = await documentsForm.trigger()
      if (!isDocumentsValid) {
        alert("Please correct the validation errors in the documents section before uploading.")
        return
      }

      // 2. Collect files and build FormData
      const values = documentsForm.getValues()
      const formData = new FormData()
      let hasFiles = false

      for (const [key, val] of Object.entries(values)) {
        if (val && val instanceof File) {
          formData.append(key, val)
          hasFiles = true
        }
      }

      if (!hasFiles) {
        alert("No files selected for upload.")
        return
      }

      // 3. Post to /api/upload via Axios
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data && response.data.success && response.data.urls) {
        // 4. Map returned URLs back to form values
        for (const [key, url] of Object.entries(response.data.urls)) {
          documentsForm.setValue(key as any, url, { shouldValidate: true })
        }
        setIsUploaded(true)
        alert("All documents uploaded and compressed successfully!")
      } else {
        alert(response.data?.message || "File upload failed.")
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      alert(err.response?.data?.message || "An error occurred during file upload.")
    } finally {
      setIsUploading(false)
    }
  }

  // 1. Personal Details Form
  const personalForm = useForm<StudentDataType>({
    resolver: zodResolver(studentDataZodSchema),
    defaultValues: {
      UAN: "",
      registrationNumber: "",
      universityRoll: "",
      admissionNumber: "",
      confidentialNumber: "",
      profileNumber: "",
      admissionType: "OTHER",
      ABCID: "",
      name: "",
      avatar: undefined,
      DOB: "",
      AadharNumber: "",
      phone: "",
      email: "",
      gender: "",
      fathersName: "",
      mothersName: "",
      religion: "",
      caste: "",
      reservation: "",
      isMinority: false,
      city: "",
      district: "",
      state: "",
      pinCode: "",
      batch: "",
      currentSemesterCount: 1,
      subMJC: "",
      subMIC: [],
      subMDC: [],
      subAEC: [],
      subSEC: [],
      subVAC: [],
    }
  })

  // 2. Previous Academic Details Form
  const academicForm = useForm<AcademicDetailsType>({
    resolver: zodResolver(academicDetailsZodSchema),
    defaultValues: {
      schoolName: "",
      board: "",
      obtainedMarks: 0,
      totalMarks: 0,
      percentage: 0,
      rollNo: "",
      rollCode: "",
      address: "",
      city: "",
      district: "",
      state: "",
      pinCode: "",
      ugInstituteName: "",
      ugUniversityName: "",
      ugObtainedMarks: undefined,
      ugTotalMarks: undefined,
      ugPercentage: undefined,
      ugRollNo: "",
      ugAddress: "",
      ugCity: "",
      ugDistrict: "",
      ugState: "",
      ugPinCode: "",
    }
  })

  // 3. Documents Upload Form
  const documentsForm = useForm<DocumentsUploadType>({
    resolver: zodResolver(documentsUploadZodSchema),
    defaultValues: {
      Aadhar: undefined,
      cast: undefined,
      domicile: undefined,
      income: undefined,
      pwd: undefined,
      previousLC: undefined,
      previousMigration: undefined,
      previousMarksheet: undefined,
      photo: undefined,
      signature: undefined,
    }
  })

  // Automatically sync documents photo field to personalForm's avatar field
  const watchedPhoto = documentsForm.watch("photo")

  useEffect(() => {
    if (watchedPhoto) {
      personalForm.setValue("avatar", watchedPhoto, { shouldValidate: true })
    } else {
      personalForm.setValue("avatar", undefined, { shouldValidate: true })
    }
  }, [watchedPhoto, personalForm])

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      // Trigger validation on all forms in parallel
      const [isPersonalValid, isAcademicValid, isDocumentsValid] = await Promise.all([
        personalForm.trigger(),
        academicForm.trigger(),
        documentsForm.trigger(),
      ])

      if (isPersonalValid && isAcademicValid && isDocumentsValid) {
        console.log("=== Consolidated Form Submission ===")
        console.log("Personal Details:", personalForm.getValues())
        console.log("Academic Details:", academicForm.getValues())
        console.log("Uploaded Documents:", documentsForm.getValues())
        alert("Form validated successfully! Check console for submission details.")
      } else {
        console.warn("Validation failed in one or more forms:", {
          personalFormValid: isPersonalValid,
          personalErrors: personalForm.formState.errors,
          academicFormValid: isAcademicValid,
          academicErrors: academicForm.formState.errors,
          documentsFormValid: isDocumentsValid,
          documentsErrors: documentsForm.formState.errors,
        })
        alert("Please correct the validation errors in the form before submitting.")
      }
    } catch (err) {
      console.error("Submission error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
          Student Admission Registration
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          Please complete your basic information, academic background, and upload all required documents to finalize your admission.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Personal Details */}
        <PersonalDetailsForm form={personalForm} />

        {/* Section 2: Previous Academic Details */}
        <PreviousAcademicDetailsForm form={academicForm} />

        {/* Section 3: Documents Upload */}
        <DocumentsUploadForm form={documentsForm} />

        <div className="flex justify-end pt-4 px-2 gap-4">
          {!isUploaded ? (
            <Button
              type="button"
              size="lg"
              className="w-full md:w-auto px-8 font-semibold shadow-md bg-chart-4 hover:bg-chart-4/90 transition-all cursor-pointer rounded-full"
              disabled={isUploading}
              onClick={onUpload}
            >
              {isUploading ? "Uploading & Compressing..." : "Upload Documents"}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="w-full md:w-auto px-8 font-semibold shadow-md bg-primary hover:bg-primary/90 transition-all cursor-pointer rounded-full"
              disabled={isLoading}
              onClick={onSubmit}
            >
              {isLoading ? "Validating..." : "Submit Registration"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}