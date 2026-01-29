import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    alt: "John Doe",
  },
};

export const WithImage: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    alt: "User Avatar",
  },
};

export const Small: Story = {
  args: {
    alt: "Small User",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    alt: "Large User",
    size: "lg",
  },
};

export const WithFallback: Story = {
  args: {
    alt: "Kathryn Murphy",
    fallback: "KM",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar alt="Small" size="sm" />
      <Avatar alt="Medium" size="md" />
      <Avatar alt="Large" size="lg" />
    </div>
  ),
};
