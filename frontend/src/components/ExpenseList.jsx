import React from "react";
import PropTypes from "prop-types";

function ExpenseList({ expenses }) {
  return (
    <ul>
      {expenses.map((expense, index) => (
        <li key={index}>
          {expense.title}: ${expense.amount}
        </li>
      ))}
    </ul>
  );
}

ExpenseList.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ExpenseList;
