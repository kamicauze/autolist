import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const carMakes = [
  { value: "any", label: "Any Make" },
  { value: "bmw", label: "BMW" },
  { value: "mercedes", label: "Mercedes-Benz" },
  { value: "toyota", label: "Toyota" },
  { value: "honda", label: "Honda" },
  { value: "nissan", label: "Nissan" },
];

const bodyTypes = [
  { value: "any", label: "Any Body Type" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "truck", label: "Truck" },
  { value: "coupe", label: "Coupe" },
];

export const Default: Story = {
  render: () => (
    <Select defaultValue="any">
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a make" />
      </SelectTrigger>
      <SelectContent>
        {carMakes.map((make) => (
          <SelectItem key={make.value} value={make.value}>
            {make.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-64 gap-1.5">
      <Label htmlFor="make">Car Make</Label>
      <Select defaultValue="any">
        <SelectTrigger id="make">
          <SelectValue placeholder="Select a make" />
        </SelectTrigger>
        <SelectContent>
          {carMakes.map((make) => (
            <SelectItem key={make.value} value={make.value}>
              {make.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

export const BodyTypeSelect: Story = {
  render: () => (
    <div className="grid w-64 gap-1.5">
      <Label htmlFor="body">Body Type</Label>
      <Select defaultValue="any">
        <SelectTrigger id="body">
          <SelectValue placeholder="Select body type" />
        </SelectTrigger>
        <SelectContent>
          {bodyTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled defaultValue="any">
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a make" />
      </SelectTrigger>
      <SelectContent>
        {carMakes.map((make) => (
          <SelectItem key={make.value} value={make.value}>
            {make.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

export const SearchFilters: Story = {
  render: () => (
    <div className="flex gap-4">
      <Select defaultValue="any">
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Make" />
        </SelectTrigger>
        <SelectContent>
          {carMakes.map((make) => (
            <SelectItem key={make.value} value={make.value}>
              {make.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="any">
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Body Type" />
        </SelectTrigger>
        <SelectContent>
          {bodyTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="any">
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Price Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Price</SelectItem>
          <SelectItem value="0-50000">Under 50K</SelectItem>
          <SelectItem value="50000-100000">50K - 100K</SelectItem>
          <SelectItem value="100000+">Over 100K</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
