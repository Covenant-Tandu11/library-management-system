import { useEffect, useState } from "react";
import {
    Search,
    Bell,
    ChevronDown,
    Plus,
} from "lucide-react";
import { Link, useSearchParams } from 'react-router'
import { supabase } from "../../lib/supabase";
import { useBookStore } from "../../zustand/useBookStore";

type HeaderProps = {
    variant: "dashboard" | "catalogue";
    onAddBook?: () => void;
};

const Header = ({ variant, onAddBook }: HeaderProps) => {
    const isDashboard = variant === "dashboard";
    const [searchParams, setSearchParams] = useSearchParams();
    const { books } = useBookStore();
    const [staffName, setStaffName] = useState("Account");
    const [staffEmail, setStaffEmail] = useState("");

    useEffect(() => {
        let isMounted = true;

        supabase.auth.getUser().then(({ data, error }) => {
            if (error) {
                console.error("Unable to load signed-in user:", error);
                return;
            }

            if (!isMounted || !data.user) return;

            const metadataName =
                data.user.user_metadata?.full_name ??
                data.user.user_metadata?.name;
            const emailName = data.user.email?.split("@")[0];
            setStaffName(
                typeof metadataName === "string" && metadataName.trim()
                    ? metadataName
                    : emailName || "Account",
            );
            setStaffEmail(data.user.email ?? "");
        }).catch((error: unknown) => {
            console.error("Unable to load signed-in user:", error);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const staffInitial = staffName.trim().charAt(0).toUpperCase() || "A";
    const categories = [...new Set(books.map((book) => book.category).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second));
    const selectedCategory = searchParams.get("category") ?? "";

    return (
        <header className="flex w-full flex-wrap items-center justify-between gap-3 bg-white px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-5">
        {/* Search bar */}
        <div className="flex w-full min-w-0 flex-1 items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 sm:w-auto">
            <Search size={18} className="shrink-0 text-gray-400" />

            <input
            type="search"
            placeholder={
                isDashboard
                ? "Search books, students, or transactions..."
                : "Search books by title, author, ISBN..."
            }
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
        </div>

        {isDashboard ? (
            /* Dashboard header controls */
            <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
            <button
                type="button"
                aria-label="Notifications"
                className="relative text-gray-600 hover:text-gray-900"
            >
                <Bell size={20} />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button
                type="button"
                className="flex items-center gap-3"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18212B] text-sm text-white">
                {staffInitial}
                </span>

                <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold text-gray-800">
                    {staffName}
                </span>
                <span className="block text-xs text-gray-500">
                    {staffEmail || "Library account"}
                </span>
                </span>

                <ChevronDown size={16} className="text-gray-500" />
            </button>
            </div>
        ) : (
            /* Book catalogue header controls */
            <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
            <select
                value={selectedCategory}
                onChange={(event) => {
                    const category = event.target.value;
                    setSearchParams((previous) => {
                        if (category) previous.set("category", category);
                        else previous.delete("category");
                        return previous;
                    });
                }}
                aria-label="Filter by category"
                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-600 outline-none sm:flex-none sm:max-w-none"
            >
                <option value="">All Categories</option>
                {categories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>

            <Link
                to="/addForm"
                onClick={onAddBook}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#18212B] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Book</span>
            </Link>
            </div>
        )}
        </header>
    );
};

export default Header;
