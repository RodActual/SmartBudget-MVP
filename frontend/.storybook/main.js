import { mergeConfig } from "vite";
import react from "@vitejs/plugin-react";

    const config = {
      stories: [
        "../src/**/*.mdx",
        "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      ],
      addons: [
        "@storybook/addon-onboarding",
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@chromatic-com/storybook",
        "@storybook/addon-interactions",
      ],
      framework: {
        name: "@storybook/react-vite",
        options: {},
      },
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      plugins: [react()],
      esbuild: {
        loader: "jsx",
        include: /src\/.*\.js$/,
      },
      resolve: {
        extensions: [".js", ".jsx"],
      },
    });
  },
};

export default config;