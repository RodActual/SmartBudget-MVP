import React from "react";
import ExpenseList from "../components/ExpenseList.jsx";

export default {
  title: "Components/ExpenseList",
  component: ExpenseList,
};

export const Default = () => (
  <ExpenseList expenses={[{ title: "Groceries", amount: 50 }, { title: "Rent", amount: 1200 }]} />
);

export const Empty = () => <ExpenseList expenses={[]} />;
