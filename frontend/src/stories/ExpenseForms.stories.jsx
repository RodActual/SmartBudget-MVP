// frontend/src/stories/ExpenseForms.stories.jsx
import ExpenseForm from '../components/ExpenseForm';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Forms/Expense Form',
  component: ExpenseForm,
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'expense submitted' },
    isSubmitting: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export const Default = {
  args: {
    onSubmit: action('expense submitted'),
    isSubmitting: false,
    error: '',
  },
};

export const Submitting = {
  args: {
    onSubmit: action('expense submitted'),
    isSubmitting: true,
    error: '',
  },
};

export const WithError = {
  args: {
    onSubmit: action('expense submitted'),
    isSubmitting: false,
    error: 'Failed to connect to the server. Please try again.',
  },
};
