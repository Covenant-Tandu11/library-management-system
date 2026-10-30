
import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'

import { CloudUpload, BookMinus } from 'lucide-react'
import { useNavigate } from 'react-router'

import type { AddBookFormValues } from '../types/addBooks'
import { useBookStore } from '../zustand/useBookStore'
import type { BookPayLoad } from '../zustand/useBookStore'

import SuccessModal from './modals/SuccessModal'
import ErrorModal from './modals/ErrorModal'

import { uploadBookCover } from '../utils/uploadBookCover'


const initialFormValues: AddBookFormValues = {
    title: '',
    author: '',
    isbn: '',
    category: 'fiction',
    publisher: '',
    publication_year: '',
    total_copies: '1',
    cover_image: null,
}


const AddBookForm = () => {

    const navigate = useNavigate()

    const { addBook, isBookAddedSuccessfully } = useBookStore()

    const [formData, setFormData] =
        useState<AddBookFormValues>(initialFormValues)

    const [errorMessage, setErrorMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)


    function handleChange(
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }))
    }


    function handleImageChange(e: ChangeEvent<HTMLInputElement>) {

        const file = e.target.files?.[0] ?? null

        if (!file) return

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setErrorMessage('Please select a JPG, PNG or WEBP image.')
            e.target.value = ''
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('The cover image must be 5MB or smaller.')
            e.target.value = ''
            return
        }

        setErrorMessage('')

        setFormData((previous) => ({
            ...previous,
            cover_image: file,
        }))
    }


    async function handleSubmit(e: FormEvent<HTMLFormElement>) {

        e.preventDefault()

        setErrorMessage('')
        setIsSubmitting(true)

        const bookPayLoad: BookPayLoad = {
            title: formData.title.trim(),
            author: formData.author.trim(),
            isbn: formData.isbn.trim(),
            category: formData.category,
            publisher: formData.publisher.trim(),

            publication_year: formData.publication_year
                ? Number(formData.publication_year)
                : null,

            total_copies: Number(formData.total_copies),
            available_copies: Number(formData.total_copies),

            cover_image_url: null,
        }


        // Validate required fields
        if (
            !bookPayLoad.title ||
            !bookPayLoad.author ||
            !bookPayLoad.isbn ||
            !bookPayLoad.publisher
        ) {
            setErrorMessage('Please fill in all required fields.')
            setIsSubmitting(false)
            return
        }


        // Validate publication year
        if (
            formData.publication_year &&
            (
                !Number.isInteger(bookPayLoad.publication_year) ||
                bookPayLoad.publication_year! < 1 ||
                bookPayLoad.publication_year! > 9999
            )
        ) {
            setErrorMessage('Please enter a valid publication year.')
            setIsSubmitting(false)
            return
        }


        // Validate number of copies
        if (
            !Number.isInteger(bookPayLoad.total_copies) ||
            bookPayLoad.total_copies < 1
        ) {
            setErrorMessage('Number of copies must be at least 1.')
            setIsSubmitting(false)
            return
        }


        try {

            // 1. Upload the cover image if one was selected
            let coverImageUrl: string | null = null

            if (formData.cover_image) {
                coverImageUrl = await uploadBookCover(formData.cover_image)
            }


            // 2. Attach the image URL to the book payload
            const finalBookPayload: BookPayLoad = {
                ...bookPayLoad,
                cover_image_url: coverImageUrl,
            }


            // 3. Save the book information in Supabase
            await addBook(finalBookPayload)

        } catch (error) {

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Unable to add this book. Please try again.'
            )

        } finally {
            setIsSubmitting(false)
        }
    }


    function handleCancel() {
        setFormData(initialFormValues)
        setErrorMessage('')
    }


    return (
        <>
            <div className="space-y-5">

                <h1 className="text-2xl font-bold text-[#20242B] sm:text-3xl">
                    Add New Book
                </h1>


                <form
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    onSubmit={handleSubmit}
                >

                    {/* Book Title */}
                    <div className="flex flex-col">
                        <label htmlFor="book-title" className="text-sm font-semibold sm:text-base">
                            Book Title
                        </label>

                        <input
                            type="text"
                            id="book-title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter book title"
                            className="w-full min-w-0 rounded-lg border border-gray-400 bg-[#FAF8F2] px-3 py-2 outline-none focus:border-[#18212B]"
                        />
                    </div>


                    {/* Author */}
                    <div className="flex flex-col">
                        <label htmlFor="author-name" className="text-sm font-semibold sm:text-base">
                            Author
                        </label>

                        <input
                            type="text"
                            id="author-name"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            required
                            placeholder="Author Name"
                            className="w-full min-w-0 rounded-lg border border-gray-400 bg-[#FAF8F2] px-3 py-2 outline-none focus:border-[#18212B]"
                        />
                    </div>


                    {/* ISBN */}
                    <div className="flex flex-col">
                        <label htmlFor="isbn" className="text-sm font-semibold sm:text-base">
                            ISBN
                        </label>

                        <input
                            type="text"
                            id="isbn"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            required
                            placeholder="Enter ISBN"
                            className="w-full min-w-0 rounded-lg border border-gray-400 bg-[#FAF8F2] px-3 py-2 outline-none focus:border-[#18212B]"
                        />
                    </div>


                    {/* Category */}
                    <div className="flex flex-col">
                        <label htmlFor="category" className="text-sm font-semibold sm:text-base">
                            Category
                        </label>

                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full min-w-0 cursor-pointer rounded-lg border border-gray-400 bg-[#FAF8F2] px-3 py-2 outline-none focus:border-[#18212B]"
                        >
                            <option value="fiction">Fiction</option>
                            <option value="technology">Technology</option>
                            <option value="education">Education</option>
                            <option value="business">Business</option>
                        </select>
                    </div>


                    {/* Publisher */}
                    <div className="flex flex-col">
                        <label htmlFor="publisher" className="text-sm font-semibold sm:text-base">
                            Publisher
                        </label>

                        <input
                            type="text"
                            id="publisher"
                            name="publisher"
                            value={formData.publisher}
                            onChange={handleChange}
                            required
                            placeholder="Enter Publisher"
                            className="w-full min-w-0 rounded-lg border border-gray-400 bg-[#FAF8F2] px-3 py-2 outline-none focus:border-[#18212B]"
                        />
                    </div>


                    {/* Publication Year */}
                    <div className="flex flex-col">
                        <label htmlFor="publication-year" className="text-sm font-semibold sm:text-base">
                            Publication Year
                        </label>

                        <input
                            type="number"
                            id="publication-year"
                            name="publication_year"
                            value={formData.publication_year}
                            onChange={handleChange}
                            min="1"
                            max="9999"
                            step="1"
                            placeholder="Enter year (e.g. 2026)"
                            className="w-full min-w-0 rounded-lg border border-gray-400 bg-[#FAF8F2] px-3 py-2 outline-none focus:border-[#18212B]"
                        />
                    </div>


                    {/* Number of Copies */}
                    <div className="flex flex-col">
                        <label htmlFor="number-of-copies" className="text-sm font-semibold sm:text-base">
                            Number Of Copies
                        </label>

                        <input
                            type="number"
                            id="number-of-copies"
                            name="total_copies"
                            value={formData.total_copies}
                            onChange={handleChange}
                            min="1"
                            step="1"
                            required
                            placeholder="Enter number"
                            className="w-full min-w-0 rounded-lg border border-gray-400 bg-[#FAF8F2] px-3 py-2 outline-none focus:border-[#18212B]"
                        />
                    </div>


                    {/* Cover Image */}
                    <div className="flex flex-col gap-2">

                        <label
                            htmlFor="cover-image"
                            className="text-sm font-medium text-gray-700"
                        >
                            Cover Image
                        </label>

                        <label
                            htmlFor="cover-image"
                            className="flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-[#FAF8F2] p-3 transition-colors duration-200 hover:border-blue-400 hover:bg-blue-50"
                        >

                            {formData.cover_image ? (
                                <img
                                    src={URL.createObjectURL(formData.cover_image)}
                                    alt="Selected book cover preview"
                                    className="h-28 w-20 rounded-md object-cover"
                                />
                            ) : (
                                <CloudUpload size={22} className="text-gray-500" />
                            )}

                            <div className="text-center">

                                <p className="text-xs text-gray-600">
                                    Click to upload or drag and drop
                                </p>

                                <p className="mt-1 text-[10px] text-gray-400">
                                    PNG, JPG, WEBP (max. 5MB)
                                </p>

                                {formData.cover_image && (
                                    <p className="mt-1 text-xs text-gray-700">
                                        {formData.cover_image.name}
                                    </p>
                                )}

                            </div>
                        </label>


                        <input
                            type="file"
                            id="cover-image"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                        />

                    </div>


                    {/* Buttons */}
                    <div className="col-span-full flex flex-col gap-2 sm:flex-row">

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full cursor-pointer rounded-lg bg-[#18212B] px-6 py-2 font-semibold text-[#FAF8F2] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-11"
                        >
                            {isSubmitting ? 'Uploading...' : 'Save'}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="w-full cursor-pointer rounded-lg border border-[#18212B] px-6 py-2 font-semibold disabled:opacity-50 sm:w-auto sm:px-11"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>


            {
                isBookAddedSuccessfully && (
                    <SuccessModal
                        iconColor="text-[#D979C2]"
                        iconBackgroundColor="bg-[#F8E2E7]"
                        primaryButtonText="View Book Catalogue"
                        onPrimaryClick={() => navigate('/catalogue')}
                        icon={<BookMinus />}
                        title="Book Added Successfully"
                        subtitle="The book has been added successfully to the catalogue, you can now view it in the book catalogue"
                    />
                )
            }


            {errorMessage && (
                <ErrorModal
                    title="Could not add book"
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}

        </>
    )
}

export default AddBookForm
