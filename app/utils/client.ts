import { supabase } from './supabase';

export type Client = {
  id?: string; // // auth.user.id
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'CLIENT';
};

// CREATE
export async function addClient(client: Client): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select();

  if (error) {
    console.error(error);
    return null;
  }

  return data?.[0] ?? null;
}

// GET ALL
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*');

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

// UPDATE
export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

// DELETE
export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}
