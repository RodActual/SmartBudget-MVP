import ExpenseForm from '../components/ExpenseForm';

export default {
  title: 'Forms/Expense Form',
  component: ExpenseForm,
  tags: ['autodocs'],
  args: {
    // Use a simple function instead of action/fn
    onSubmit: (data) => {
      console.log('Form submitted:', data);
    },
  },
};

export const Default = {
  args: {},
};

export const WithInitialData = {
  args: {
    initialData: {
      description: 'Grocery Shopping',
      amount: 45.50,
      category: 'Food',
      date: '2025-11-10',
    },
  },
};