import { get, post, put, del } from './api'; 
import { auth, db } from "./firebase";

/**
 * Fetch all expenses for the current user
 */
export async function getExpenses() {
  try {
    const expenses = await get('/expenses/');
    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

/**
 * Add a new expense
 */
export async function addExpense(expenseData) {
  try {
    console.log('expenseService: Adding expense', expenseData);
    const newExpense = await post('/expenses/', expenseData);
    console.log('expenseService: Expense added successfully', newExpense);
    return newExpense;
  } catch (error) {
    console.error('expenseService: Error adding expense:', error);
    throw error;
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(expenseId, expenseData) {
  try {
    console.log('expenseService: Updating expense', expenseId, expenseData);
    const updatedExpense = await put(`/expenses/${expenseId}`, expenseData);
    console.log('expenseService: Expense updated successfully', updatedExpense);
    return updatedExpense;
  } catch (error) {
    console.error('expenseService: Error updating expense:', error);
    throw error;
  }
}

/**
 * Delete an expense by ID
 */
export async function deleteExpense(expenseId) {
  try {
    const result = await del(`/expenses/${expenseId}`);
    return result;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

/**
 * Get dashboard summary data
 */
export async function getDashboardSummary() {
  try {
    const summary = await get('/dashboard/');
    return summary;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
}

export default {
  getExpenses,
  addExpense,
  updateExpense, 
  deleteExpense,
  getDashboardSummary,
};