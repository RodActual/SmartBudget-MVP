import React from "react";
import ExpenseChart from "./ExpenseChart";

export default {
  title: "Components/ExpenseChart",
  component: ExpenseChart,
};

const Template = (args) => <div style={{ width: 480 }}><ExpenseChart {...args} /></div>;

export const Default = Template.bind({});
Default.args = {
  data: [
    { name: "Food", value: 300 },
    { name: "Rent", value: 800 },
    { name: "Utilities", value: 200 },
    { name: "Entertainment", value: 150 },
  ],
};

export const Empty = Template.bind({});
Empty.args = { data: [] };