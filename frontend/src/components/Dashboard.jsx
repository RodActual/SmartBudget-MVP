import React, { useState } from "react";
import AlertBanner from "./AlertBanner.jsx";
import Chart from "./Chart.jsx";
import ExpenseForm from "./ExpenseForm.jsx";
import ExpenseList from "./ExpenseList.jsx";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [alert, setAlert] = useState("");

  const handleAddExpense = (expense) => {
    setExpenses([...expenses, expense]);
    setAlert(`Added ${expense.name} for $${expense.amount.toFixed(2)}`);
    setTimeout(() => setAlert(""), 3000); // clear alert after 3s
  };

  return (
    <div className="dashboard">
      <h1>SmartBudget Dashboard</h1>
      <AlertBanner message={alert} type="success" />
      <ExpenseForm onAdd={handleAddExpense} />
      <ExpenseList expenses={expenses} />
      <Chart
        data={expenses.map(e => e.amount)}
        title="Expenses Overview"
      />
    </div>
  );
}

export default Dashboard;
