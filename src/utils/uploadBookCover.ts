
import { supabase } from "../lib/supabase";

export const uploadBookCover = async (file: File): Promise<string> => {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    const { data, error } = await supabase.storage
        .from("book-covers")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
        });

    if (error) {
        throw error;
    }

    const { data: publicUrlData } = supabase.storage
        .from("book-covers")
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
};
