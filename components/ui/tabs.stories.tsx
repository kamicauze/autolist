import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="buy" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="buy">Buy</TabsTrigger>
        <TabsTrigger value="pre-order">Pre-Order</TabsTrigger>
        <TabsTrigger value="accessories">Accessories</TabsTrigger>
      </TabsList>
      <TabsContent value="buy">
        <p className="text-sm text-muted-foreground p-4">
          Browse cars available for immediate purchase.
        </p>
      </TabsContent>
      <TabsContent value="pre-order">
        <p className="text-sm text-muted-foreground p-4">
          Pre-order upcoming vehicles before they arrive.
        </p>
      </TabsContent>
      <TabsContent value="accessories">
        <p className="text-sm text-muted-foreground p-4">
          Find parts and accessories for your vehicle.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const VehicleCategories: Story = {
  render: () => (
    <Tabs defaultValue="sedan" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="sedan">Sedan</TabsTrigger>
        <TabsTrigger value="suv">SUV</TabsTrigger>
        <TabsTrigger value="truck">Truck</TabsTrigger>
        <TabsTrigger value="sports">Sports</TabsTrigger>
      </TabsList>
      <TabsContent value="sedan" className="p-4">
        Comfortable sedans for daily commute.
      </TabsContent>
      <TabsContent value="suv" className="p-4">
        Spacious SUVs for family adventures.
      </TabsContent>
      <TabsContent value="truck" className="p-4">
        Powerful trucks for work and play.
      </TabsContent>
      <TabsContent value="sports" className="p-4">
        High-performance sports cars.
      </TabsContent>
    </Tabs>
  ),
};
