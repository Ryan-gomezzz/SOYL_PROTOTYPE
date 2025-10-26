/**
 * Authentication and Authorization Utilities
 * Manages user roles (admin/user) and provides role-based access control
 */

export type UserRole = 'admin' | 'user' | 'guest';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt: string;
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('soyl_user');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return user;
  } catch {
    return null;
  }
};

// Set current user
export const setCurrentUser = (user: User): void => {
  localStorage.setItem('soyl_user', JSON.stringify(user));
};

// Check if user has specific role
export const hasRole = (requiredRole: UserRole): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Define role hierarchy
  const roleHierarchy: Record<UserRole, number> = {
    guest: 0,
    user: 1,
    admin: 2,
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

// Check if user is admin
export const isAdmin = (): boolean => {
  return hasRole('admin');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('soyl_id_token');
  const user = getCurrentUser();
  return !!(token && user);
};

// Mock user database for now - In production, this would be in DynamoDB
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@soyl.com',
    role: 'admin',
    name: 'Admin User',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'user@soyl.com',
    role: 'user',
    name: 'Regular User',
    createdAt: new Date().toISOString(),
  },
];

// Admin credentials - In production, this would use AWS Cognito or another auth provider
export const ADMIN_EMAIL = 'admin@soyl.com';
export const ADMIN_PASSWORD = 'admin123'; // Change this in production!
export const ADMIN_TOKENS = ['admin-token-12345']; // In production, use JWT tokens

// Login function
export const login = async (email: string, password: string): Promise<User | null> => {
  // Check for admin
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminUser = mockUsers.find(u => u.email === ADMIN_EMAIL);
    if (adminUser) {
      setCurrentUser(adminUser);
      localStorage.setItem('soyl_id_token', 'admin-token-12345');
      return adminUser;
    }
  }
  
  // In production, this would verify against AWS Cognito
  // For now, check mock users
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    setCurrentUser(user);
    // Generate a mock token
    localStorage.setItem('soyl_id_token', `token-${user.id}`);
    return user;
  }
  
  return null;
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('soyl_id_token');
  localStorage.removeItem('soyl_user');
  localStorage.removeItem('soyl_email');
};

// Register new user (default to 'user' role)
export const register = async (email: string, password: string, name?: string): Promise<User | null> => {
  // In production, this would use AWS Cognito signup
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    role: 'user',
    name: name || email,
    createdAt: new Date().toISOString(),
  };
  
  mockUsers.push(newUser);
  setCurrentUser(newUser);
  localStorage.setItem('soyl_id_token', `token-${newUser.id}`);
  return newUser;
};

