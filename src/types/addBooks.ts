export interface Books {
  id?: string
  title: string
  author: string
  isbn: string
  category: string
  publisher: string
  publication_year: number | null
  total_copies: number
  cover_image_url: string | null
  created_at?: string
  updated_at?: string
  available_copies: number
}

export interface AddBookFormValues {
    title: string
    author: string
    isbn: string
    category: string
    publisher: string
    publication_year: string
    total_copies: string
    cover_image: File | null
}