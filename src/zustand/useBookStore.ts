import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Books } from "../types/addBooks";

export type BookPayLoad = Omit<Books, 'id' | 'created_at' | 'updated_at'>

interface BookStore {
    books: Books[]
    addBook: (book: BookPayLoad) => Promise<void>;
    isBookAddedSuccessfully: boolean
    fetchBooks: () => Promise<void>
}



export const useBookStore = create<BookStore>((set) => ({
    books: [],
    isBookAddedSuccessfully: false,
    addBook: async (book: BookPayLoad) => {
        set({ isBookAddedSuccessfully: false });
        try {
            const { error } = await supabase
                .from("books")
                .insert(book);

                if (error) throw error;
                set({ isBookAddedSuccessfully: true });

                await useBookStore.getState().fetchBooks();
        } catch (error) {
            console.error("Error adding book:", error);
            throw error;
        }
    },
    fetchBooks: async () => {
    const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

    console.log('Session:', session);
    console.log('Session error:', sessionError);

    const { data, error } = await supabase
        .from('books')
        .select('*');

    console.log('Books from Supabase:', data);
    console.log('Supabase error:', error);

    if (error) throw error;

    const books: Books[] = (data ?? [])
        .map((book) => {
            const totalCopies = Number(book.total_copies ?? 0);

            const availableCopies = Number(
                book.available_copies ?? book.total_copies ?? 0
            );

            return {
                ...book,
                title: book.title ?? '',
                author: book.author ?? '',
                isbn: book.isbn ?? '',
                category: book.category ?? '',
                total_copies: Number.isFinite(totalCopies)
                    ? totalCopies
                    : 0,
                available_copies: Number.isFinite(availableCopies)
                    ? availableCopies
                    : Number.isFinite(totalCopies)
                        ? totalCopies
                        : 0,
            };
        });

    set({ books });
},
}));