import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/profile";

export interface ProfileStore{
    profile: Profile,
    isOpenSuccessModal: boolean,
}