// src/services/api.js
// This file centralizes all API calls to the Flask backend.

const API_BASE_URL = 'http://127.0.0.1:5000/api';

/**
 * A helper function to handle common fetch logic, error handling,
 * and JSON parsing.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login')
 * @param {object} options - The options for the fetch call (method, headers, body)
 * @returns {Promise<object>} - The JSON response from the API
 */
const apiFetch = async (endpoint, options = {}) => {
  // Set default headers if not provided
  options.headers = options.headers || {
    'Content-Type': 'application/json',
  };

  // Later, you would add the auth token here automatically:
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   options.headers['Authorization'] = `Bearer ${token}`;
  // }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    const data = await response.json();

    if (!response.ok) {
      // If response is not ok, throw an error with the message from the API
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    // The backend routes consistently return { status: 'success', ... }
    if (data.status === 'success') {
      return data.data || data; // Return the 'data' payload if it exists
    } else {
      // Handle cases where response is 200 OK but API reports an error
      throw new Error(data.message || 'An API error occurred');
    }

  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    // Re-throw the error so the component can catch it and set error state
    throw error;
  }
};

// --- Authentication Service ---

/**
 * Logs in a user.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} - { token, user_id, message }
 */
export const login = (email, password) => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Registers a new user.
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} - { user_id, message }
 */
export const register = (name, email, password) => {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};


// --- Dashboard Service ---

/**
 * Fetches the aggregated metrics for the main dashboard.
 * @returns {Promise<object>} - Dashboard metrics data
 */
export const getDashboardMetrics = () => {
  // 'data' payload will be: { total_spent, total_budget, remaining_budget, categories }
  return apiFetch('/dashboard', { method: 'GET' });
};


// --- Expenses Service ---

/**
 * Fetches all expenses for the user.
 * @returns {Promise<array>} - A list of expense objects
 */
export const getExpenses = () => {
  // 'data' payload will be the list of expenses
  return apiFetch('/expenses', { method: 'GET' });
};

/**
 * Adds a new expense.
 * @param {object} expenseData - { description, amount, category_id, date }
 * @returns {Promise<object>} - The newly created expense object
 */
export const addExpense = (expenseData) => {
  return apiFetch('/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });
};
