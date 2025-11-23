import React, { useState } from 'react';
import { addExpense } from '../services/api'; // <-- IMPORTING from your new service

/**
 * A form for adding a new expense.
 * @param {function} onExpenseAdded - Callback function to run after an expense is successfully added.
 */
const ExpenseForm = ({ onExpenseAdded }) => {
  // State for each form field
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(''); // Assuming '1' is a default/mock category
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Defaults to today

  // State for form handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This function now calls your Flask backend's add expense endpoint
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const expenseData = {
      description,
      amount: parseFloat(amount),
      category_id: categoryId || '1', // Use '1' (Food) if nothing is selected
      date,
    };

    try {
      // --- CLEANER API CALL ---
      const newExpense = await addExpense(expenseData);

      // --- SUCCESS ---
      console.log('Expense Added!', newExpense);
      
      // Clear the form
      setDescription('');
      setAmount('');
      setCategoryId('');
      
      // Call the parent's callback function to refresh the dashboard
      if (onExpenseAdded) {
        onExpenseAdded(newExpense.data); // Pass the new expense back up
      }

    } catch (err) {
      // --- ERROR HANDLING ---
      console.error('Add expense error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      className="p-6 bg-white rounded-xl shadow-lg space-y-4"
      onSubmit={handleSubmit}
    >
      <h3 className="text-xl font-semibold text-gray-900">Add New Expense</h3>
      
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <input
          type="text"
          id="description"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Coffee"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          required
          disabled={loading}
        />
      </div>

      {/* This is a simple text input for category. In a real app,
        this would be a <select> dropdown populated from the API.
      */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category ID (Mock)
        </label>
        <input
          type="text"
          id="category"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          placeholder="e.g., 1 (Food)"
          disabled={loading}
        />
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;
