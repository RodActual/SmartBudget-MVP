import React from 'react';
import ExpenseChart from '../components/ExpenseChart';

const MOCK_EXPENSE_DATA = [
  { name: 'Rent/Housing', value: 1200 },
  { name: 'Groceries/Food', value: 450 },
  { name: 'Utilities', value: 180 },
  { name: 'Transportation', value: 120 },
  { name: 'Entertainment', value: 100 },
  { name: 'Savings', value: 500 },
];

export default {
  title: 'Dashboard/Expense Chart',
  component: ExpenseChart,
  tags: ['autodocs'],
};

export const CategoryBreakdown = {
  args: {
    data: MOCK_EXPENSE_DATA,
  },
};

export const ZeroData = {
  args: {
    data: [],
  },
};