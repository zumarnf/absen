// ============================================
// USER TYPES
// ============================================
export interface User {
  _id: string;
  username: string;
  nama: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  _id: string;
  username: string;
  nama: string;
  role: string;
}
