import { supabase } from "@/app/services/supabase";
import { Client } from "./types";

// CREATE
export async function addClient(client: Client): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .insert([client])
    .select();

  if (error) {
    console.error("addClient error:", error);
    return null;
  }

  return data?.[0] ?? null;
}

// GET ALL
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*");

  if (error) {
    console.error("getClients error:", error);
    return [];
  }

  return data ?? [];
}

export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// UPDATE BY ID
export async function updateClient(
  id: string,
  updates: Partial<Client>
): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateClient error:", error);
    return null;
  }

  return data;
}

// DELETE BY ID
export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteClient error:", error);
    return false;
  }

  return true;
}
