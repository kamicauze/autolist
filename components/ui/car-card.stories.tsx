import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CarCard } from "./car-card";

const meta: Meta<typeof CarCard> = {
  title: "Components/CarCard",
  component: CarCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "1",
    title: "2024 BMW X1 xDrive 20d xline",
    bodyType: "SUV",
    year: 2024,
    mileage: "72,491 kms",
    fuelType: "Diesel",
    transmission: "Automatic",
    price: 7300000,
    originalPrice: 8000000,
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=450&fit=crop",
    ],
    isFeatured: true,
    seller: {
      name: "Kathryn Murphy",
    },
  },
};

export const NotFeatured: Story = {
  args: {
    id: "2",
    title: "2023 Toyota Land Cruiser V8",
    bodyType: "SUV",
    year: 2023,
    mileage: "45,000 kms",
    fuelType: "Petrol",
    transmission: "Automatic",
    price: 12500000,
    images: [
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=450&fit=crop",
    ],
    isFeatured: false,
    seller: {
      name: "James Wilson",
    },
  },
};

export const WithDiscount: Story = {
  args: {
    id: "3",
    title: "2022 Mercedes-Benz C-Class",
    bodyType: "Sedan",
    year: 2022,
    mileage: "35,000 kms",
    fuelType: "Petrol",
    transmission: "Automatic",
    price: 5800000,
    originalPrice: 6500000,
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&h=450&fit=crop",
    ],
    isFeatured: true,
    seller: {
      name: "Auto Palace Kenya",
    },
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      <CarCard
        id="1"
        title="2024 BMW X1 xDrive 20d"
        bodyType="SUV"
        year={2024}
        mileage="72,491 kms"
        fuelType="Diesel"
        transmission="Automatic"
        price={7300000}
        originalPrice={8000000}
        images={[
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=450&fit=crop",
          "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=450&fit=crop",
        ]}
        isFeatured={true}
        seller={{ name: "Kathryn Murphy" }}
      />
      <CarCard
        id="2"
        title="2023 Toyota Prado TX-L"
        bodyType="SUV"
        year={2023}
        mileage="28,000 kms"
        fuelType="Diesel"
        transmission="Automatic"
        price={9500000}
        images={[
          "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=450&fit=crop",
        ]}
        isFeatured={false}
        seller={{ name: "Premium Motors" }}
      />
      <CarCard
        id="3"
        title="2022 Mazda CX-5"
        bodyType="SUV"
        year={2022}
        mileage="45,000 kms"
        fuelType="Petrol"
        transmission="Automatic"
        price={4200000}
        originalPrice={4500000}
        images={[
          "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=600&h=450&fit=crop",
          "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=450&fit=crop",
          "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=450&fit=crop",
        ]}
        isFeatured={true}
        seller={{ name: "AutoMart Kenya" }}
      />
    </div>
  ),
};
