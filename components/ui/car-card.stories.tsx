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

export const CategoryIcons: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="grid gap-6 bg-gray-50 p-8 md:grid-cols-2 xl:grid-cols-4">
      <CarCard
        id="icon-preview-motorbike"
        title="2025 BMW R 1300 GS"
        bodyType="touring"
        category="motorbike"
        metadata={{
          details: {
            fuelSystem: "fuel_injection",
            engineCapacity: "1300",
          },
        }}
        year={2025}
        mileage="5,000 kms"
        fuelType="N/A"
        transmission="N/A"
        price={3200000}
        images={["/placeholder-car.jpg"]}
        seller={{ name: "Motorbike Preview" }}
      />
      <CarCard
        id="icon-preview-truck"
        title="2022 Isuzu F-Series"
        bodyType="tipper"
        category="truck"
        metadata={{
          details: {
            axleConfiguration: "6x4",
            loadCapacity: "18",
          },
        }}
        year={2022}
        mileage="48,000 kms"
        fuelType="Diesel"
        transmission="Manual"
        price={7800000}
        images={["/placeholder-car.jpg"]}
        seller={{ name: "Truck Preview" }}
      />
      <CarCard
        id="icon-preview-plant"
        title="2021 Caterpillar 320"
        bodyType="excavator"
        category="plant_construction"
        metadata={{
          details: {
            operatingHours: "6400",
            operatingWeight: "22000",
            operationalStatus: "working",
          },
        }}
        year={2021}
        mileage="N/A"
        fuelType="N/A"
        transmission="N/A"
        price={14500000}
        images={["/placeholder-car.jpg"]}
        seller={{ name: "Plant Preview" }}
      />
      <CarCard
        id="icon-preview-farm"
        title="2023 Massey Ferguson MF 385"
        bodyType="compact_tractor"
        category="farm_agricultural"
        metadata={{
          details: {
            farmCategory: "tractors",
            equipmentType: "compact_tractor",
            operatingHours: "1200",
            powerOutput: "85",
            operationalStatus: "working",
          },
        }}
        year={2023}
        mileage="N/A"
        fuelType="N/A"
        transmission="N/A"
        price={5400000}
        images={["/placeholder-car.jpg"]}
        seller={{ name: "Farm Preview" }}
      />
    </div>
  ),
};
