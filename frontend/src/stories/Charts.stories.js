// frontend/src/stories/Chart.stories.jsx
import SpendingTrendChart from '../components/Chart';

// Sample mock data for the chart
const mockData = [
  { label: 'Wk 1', value: 350 },
  { label: 'Wk 2', value: 280 },
  { label: 'Wk 3', value: 410 },
  { label: 'Wk 4', value: 390 },
  { label: 'Wk 5', value: 310 },
  { label: 'Wk 6', value: 450 },
];

const mockSavingsData = [
  { label: 'Jan', value: 100 },
  { label: 'Feb', value: 150 },
  { label: 'Mar', value: 120 },
  { label: 'Apr', value: 250 },
  { label: 'May', value: 200 },
];

export default {
  title: 'Dashboard/Charts',
  component: SpendingTrendChart,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
};

export const WeeklySpendingTrend = {
  args: {
    title: 'Weekly Spending Over 6 Weeks',
    data: mockData,
  },
};

export const MonthlySavingsTrend = {
  args: {
    title: 'Monthly Savings Goal',
    data: mockSavingsData,
  },
};
