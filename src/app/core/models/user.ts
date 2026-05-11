// Full shape returned by JSONPlaceholder /users
export interface UserApiResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipcode: string;
  };
  phone: string;
  website: string;
  company: {
    name: string;
  };
}

// Trimmed model — only what our UI needs
export interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  company: string;
}