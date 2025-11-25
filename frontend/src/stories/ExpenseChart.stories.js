import React from 'react';
import ExpenseChart from '../components/ExpenseChart';

const MOCK_CATEGORY_DATA = [
  { category: 'Food', spent: 150.50, budget: 150, status: 'Warning' },
  { category: 'Transportation', spent: 35.00, budget: 50, status: 'On Track' },
  { category: 'Entertainment', spent: 80.00, budget: 75, status: 'Over Budget' },
];

export default {
  title: 'Dashboard/Expense Chart',
  component: ExpenseChart,
  tags: ['autodocs'],
};

export const CategoryBreakdown = {
  args: {
    data: MOCK_CATEGORY_DATA,
  },
};

export const ZeroData = {
  args: {
    data: [],
  },
};