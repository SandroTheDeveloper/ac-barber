export type Client = {
  id?: string; // // auth.user.id
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'CLIENT';
};