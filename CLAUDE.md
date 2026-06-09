
## Server Action Conventions

- Route actions should start with `"use server"`.
- Each action should handle auth/session checks inside the action itself.
- For writes, validate incoming payloads with the route-local Zod schema before database access.
- Keep action return shapes consistent:
  - success: `{ success: true, data }`
  - failure: `{ success: false, message }`
- Catch database or action errors and return a readable `message` string for the client layer.



# Mutation Conventions

## File Location

All mutation hooks live in `app/<route>/query/`, alongside read hooks.

```
app/
└── patients/
    ├── lib/
    │   └── actions.ts          # Server action called by the mutation
    └── query/
        ├── mut-add-patient.ts      # create
        ├── mut-update-patient.ts   # update
        └── mut-delete-patient.ts   # delete
```

---

## Naming Convention

| Operation | File name | Hook name |
|---|---|---|
| Create | `mut-add-<entity>.ts` | `useMutAddPatient` |
| Update | `mut-update-<entity>.ts` | `useMutUpdatePatient` |
| Delete | `mut-delete-<entity>.ts` | `useMutDeletePatient` |

---

## The Server Action (`app/patients/lib/actions.ts`)

```ts
"use server"

import { addPatientSchema, type AddPatientSchema } from "@/app/patients/lib/zod-type/add-patient-type"

export async function addPatient(payload: AddPatientSchema) {
  const parsed = addPatientSchema.safeParse(payload)
  if (!parsed.success) return { success: false, message: "Invalid payload" }

  try {
    const data = await db.patients.create({ data: parsed.data })
    return { success: true, data }
  } catch {
    return { success: false, message: "Failed to add patient" }
  }
}
```

**Rules:**
- Always start with `"use server"`
- Do auth/session check at the top
- Validate with the route-local Zod schema before any DB access
- Return shape is always `{ success: true, data }` or `{ success: false, message }`

---

## The Mutation Hook (`app/patients/query/mut-add-patient.ts`)

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addPatient } from "@/app/patients/lib/actions"
import { toast } from "sonner"
import type { AddPatientSchema } from "@/app/patients/lib/zod-type/add-patient-type"

export function useMutAddPatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AddPatientSchema) => {
      const res = await addPatient(payload)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      toast.success("Patient added")
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })
}
```

**3 mandatory steps inside every mutation hook:**
1. Call the server action
2. Throw `new Error(res.message)` if `!res.success`
3. Call `invalidateQueries` on success — **never skip this**

---

## Consuming the Hook (Client Component)

Lives in `app/patients/_components/add-patient-form.tsx` or inline in the route page.

```tsx
"use client"

import { useMutAddPatient } from "@/app/patients/query/mut-add-patient"

export function AddPatientForm() {
  const { mutate, isPending } = useMutAddPatient()

  function onSubmit(values: AddPatientSchema) {
    mutate(values)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* fields */}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Add Patient"}
      </Button>
    </form>
  )
}
```

---

## Update & Delete Variants

**`mut-update-patient.ts`**
```ts
export function useMutUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdatePatientSchema) => {
      const res = await updatePatient(payload)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      toast.success("Patient updated")
    },
    onError: (err) => toast.error(err.message),
  })
}
```

**`mut-delete-patient.ts`**
```ts
export function useMutDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deletePatient(id)
      if (!res.success) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      toast.success("Patient deleted")
    },
    onError: (err) => toast.error(err.message),
  })
}
```

---

## Query Key Alignment

The query key used in `invalidateQueries` must match exactly what the read hook (`use-get-patients.ts`) declares.

```ts
// use-get-patients.ts
queryKey: ["patients"]

// mut-add-patient.ts  /  mut-update-patient.ts  /  mut-delete-patient.ts
queryClient.invalidateQueries({ queryKey: ["patients"] })
```

If the read hook uses a more specific key (e.g. `["patients", id]`), invalidate that exact key — not a broad parent.

---

## Rules Summary

| ✅ Do | ❌ Don't |
|---|---|
| Always throw on `!res.success` | Don't swallow errors silently |
| Always invalidate the related query key | Don't skip invalidation on create/update/delete |
| Keep toast feedback inside the mutation hook | Don't scatter toast calls across components |
| Use `isPending` to disable the submit button | Don't allow double submissions |
| Name files `mut-<action>-<entity>.ts` | Don't use generic names like `mutation.ts` |