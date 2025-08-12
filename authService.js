/**
 * Authentication service for the Sales Report System
 * Handles user login, logout, and role-based access control
 */

// Demo users for testing purposes
const DEMO_USERS = [
  {
    id: "admin-uuid",
    username: "Remon",
    password: "admin123", // In a real app, this would be hashed
    name: "Admin User",
    role: "supervisor",
    region: "All" // Supervisors can access all regions
  },
  {
    id: "agent1-uuid",
    username: "agent1",
    password: "agent123",
    name: "Remon",
    role: "agent",
    region: "Egypt"
  },
  {
    id: "agent2-uuid",
    username: "agent2",
    password: "agent123",
    name: "Sarah Johnson",
    role: "agent",
    region: "UAE"
  },
  {
    id: "agent3-uuid",
    username: "agent3",
    password: "agent123",
    name: "Mohammed Al-Fayed",
    role: "agent",
    region: "Saudi Arabia"
  }
];

// Key for localStorage
const USER_STORAGE_KEY = 'sales_report_user';
const ALL_USERS_KEY = 'sales_report_all_users';

// Initialize users in local storage if not already present
const initializeUsers = () => {
  if (!localStorage.getItem(ALL_USERS_KEY)) {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(DEMO_USERS));
  }
};

/**
 * Authenticates a user with the given credentials
 * @param {string} username - The username to authenticate with
 * @param {string} password - The password to authenticate with
 * @returns {object|null} The authenticated user or null if authentication failed
 */
export const loginUser = (username, password) => {
  initializeUsers();
  const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_KEY));
  const user = allUsers.find(
    (u) => u.username === username && u.password === password
  );
  
  if (user) {
    // Store user in session (excluding password for security)
    const { password, ...userWithoutPassword } = user;
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }
  
  return null;
};

/**
 * Logs out the current user
 */
export const logoutUser = () => {
  sessionStorage.removeItem(USER_STORAGE_KEY);
};

/**
 * Gets the current authenticated user
 * @returns {object|null} The current user or null if no user is authenticated
 */
export const getCurrentUser = () => {
  const userJson = sessionStorage.getItem(USER_STORAGE_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Checks if the current user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getCurrentUser();
};

/**
 * Checks if the current user is a supervisor
 * @returns {boolean} True if the user is a supervisor, false otherwise
 */
export const isSupervisor = () => {
  const user = getCurrentUser();
  return user && user.role === 'supervisor';
};

/**
 * Checks if the current user can access a specific report
 * @param {Object} report - The report to check access for
 * @returns {boolean} True if the user can access the report, false otherwise
 */
export const canAccessReport = (report) => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) return false;
  
  // Supervisors can access all reports
  if (isSupervisor()) return true;
  
  // Agents can only access their own reports or reports from their region
  return report.userId === currentUser.id || report.region === currentUser.region;
};

/**
 * Gets all users (only available to supervisors)
 * @returns {Array} All users if the current user is a supervisor, empty array otherwise
 */
export const getAllUsers = () => {
  if (!isSupervisor()) {
    return [];
  }
  
  initializeUsers();
  const users = JSON.parse(localStorage.getItem(ALL_USERS_KEY));
  
  // Remove passwords for security
  return users.map(({ password, ...user }) => user);
};

/**
 * Creates a new user (only available to supervisors)
 * @param {object} userData - The user data to create
 * @returns {boolean} True if creation was successful, false otherwise
 */
export const createUser = (userData) => {
  if (!isSupervisor()) {
    return false;
  }
  
  const users = JSON.parse(localStorage.getItem(ALL_USERS_KEY));
  
  // Check for duplicate username
  if (users.some(u => u.username === userData.username)) {
    return false;
  }
  
  // Add new user with generated ID
  const newUser = {
    ...userData,
    id: `user-${Date.now()}`
  };
  
  users.push(newUser);
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  return true;
};

/**
 * Updates an existing user (only available to supervisors)
 * @param {string} userId - The ID of the user to update
 * @param {object} userData - The updated user data
 * @returns {boolean} True if update was successful, false otherwise
 */
export const updateUser = (userId, userData) => {
  if (!isSupervisor()) {
    return false;
  }
  
  const users = JSON.parse(localStorage.getItem(ALL_USERS_KEY));
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return false;
  }
  
  // Update user data, preserving the ID
  users[index] = {
    ...userData,
    id: userId
  };
  
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  return true;
};

/**
 * Deletes a user (only available to supervisors)
 * @param {string} userId - The ID of the user to delete
 * @returns {boolean} True if deletion was successful, false otherwise
 */
export const deleteUser = (userId) => {
  if (!isSupervisor()) {
    return false;
  }
  
  const users = JSON.parse(localStorage.getItem(ALL_USERS_KEY));
  const filteredUsers = users.filter(u => u.id !== userId);
  
  if (filteredUsers.length === users.length) {
    // No user was removed
    return false;
  }
  
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(filteredUsers));
  return true;
};