import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pagination } from "./pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/UI/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalPages: 5,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        searchParams: { page: "1" },
      },
    },
  },
};

export const ManyPages: Story = {
  args: {
    totalPages: 20,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        searchParams: { page: "10" },
      },
    },
  },
};

export const SinglePage: Story = {
  args: {
    totalPages: 1,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        searchParams: { page: "1" },
      },
    },
  },
};
