import React from "react";
import ExpenseList from "../components/ExpenseList";

export default {
  title: "Components/ExpenseList",
  component: ExpenseList,
  tags: ['autodocs'],
};

export const Default = {
  args: {
    expenses: [
      { title: "Groceries", amount: 50 }, 
      { title: "Rent", amount: 1200 }
    ],
  },
};

export const Empty = {
  args: {
    expenses: [],
  },
};