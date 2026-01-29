import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "secondary", "success", "warning", "destructive", "info", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Primary: Story = {
  args: {
    children: "Featured",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "New",
    variant: "secondary",
  },
};

export const Success: Story = {
  args: {
    children: "Available",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Low Stock",
    variant: "warning",
  },
};

export const Destructive: Story = {
  args: {
    children: "Sold",
    variant: "destructive",
  },
};

export const Info: Story = {
  args: {
    children: "Info",
    variant: "info",
  },
};

export const Outline: Story = {
  args: {
    children: "2024",
    variant: "outline",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Featured</Badge>
      <Badge variant="secondary">New</Badge>
      <Badge variant="success">Available</Badge>
      <Badge variant="warning">Low Stock</Badge>
      <Badge variant="destructive">Sold</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">2024</Badge>
    </div>
  ),
};
