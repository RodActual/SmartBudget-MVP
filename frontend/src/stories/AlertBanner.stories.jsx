import AlertBanner from '@/components/AlertBanner';

export default {
  title: 'Dashboard/Alert Banner',
  component: AlertBanner,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'warning', 'error'],
      description: 'The style of the alert.',
    },
    message: {
      control: 'text',
      description: 'The main content message.',
    },
  },
};

// These are the individual stories (states) of the component
export const DefaultWarning = {
  args: {
    message: 'Food category is 80% used. Consider cutting back.',
    type: 'warning',
  },
};

export const OverBudgetError = {
  args: {
    message: 'The Shopping category is $120 over budget.',
    type: 'error',
  },
};

export const GoalAchieved = {
  args: {
    message: 'Congratulations! You successfully stayed within budget this week.',
    type: 'success',
  },
};
