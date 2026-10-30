
import { create } from 'zustand'
import { supabase } from "../lib/supabase"
import type { Student } from '../types/student'

type StudentPayload = Omit<Student, "id">

interface StudentStore {
    students: Student[]
    fetchStudents: () => Promise<void>
    addStudents: (student: StudentPayload) => Promise<Student>
}

export const useStudent = create<StudentStore>((set) => ({
    students: [],

    fetchStudents: async () => {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')

            if (error) throw error

            set({ students: data ?? [] })

        } catch (error) {
            console.error("Error fetching students:", error)
            throw error
        }
    },

    addStudents: async (student) => {
    try {
        const { data: userData, error: userError } =
            await supabase.auth.getUser()

        console.log("Authenticated user:", userData.user?.id)
        console.log("User error:", userError)

        const { data, error } = await supabase
    .from('students')
    .insert(student)
    .select()
    .single()

console.log("Student data:", data)
console.log("Student insert error:", error)

        if (error) throw error

        set((state) => ({
            students: [...state.students, data as Student]
        }))

        return data as Student

    } catch (error) {
        console.error("Couldn't add student:", error)
        throw error
    }
}
}))
