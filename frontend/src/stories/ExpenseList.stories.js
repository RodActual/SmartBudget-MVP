import React from "react";
import ExpenseList from "../components/ExpenseList";

export default {
  title: "Components/ExpenseList",
  component: ExpenseList,
  tags: ['autodocs'],
};

const MOCK_EXPENSES = [
  { 
    id: '1',
    description: "Groceries",
    amount: 50.25,
    category_id: 'cat_food',
    date: '2025-11-20'
  }, 
  { 
    id: '2',
    description: "Rent",
    amount: 1200.00,
    category_id: 'cat_housing',
    date: '2025-11-01'
  },
  {
    id: '3',
    description: "Gas",
    amount: 45.00,
    category_id: 'cat_transport',
    date: '2025-11-18'
  }
];

export const Default = {
  args: {
    expenses: MOCK_EXPENSES,
    onEdit: (expense) => console.log('Edit:', expense),
    onDelete: (id) => console.log('Delete:', id),
  },
};

export const Empty = {
  args: {
    expenses: [],
  },
};

export const WithoutActions = {
  args: {
    expenses: MOCK_EXPENSES,
  },
};