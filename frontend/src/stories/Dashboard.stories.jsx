import React from 'react';
import Dashboard from '../pages/Dashboard.js';

// This default export is required by Storybook
export default {
  title: 'Pages/Dashboard',
  component: Dashboard,
  tags: ['autodocs'],
};

// A mock story to display in Storybook
export const DefaultView = {
  args: {
    // Props for your Dashboard page
  },
};
