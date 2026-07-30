import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchResults } from "./search-results";
import { Listing } from "@/lib/types/listing";

const meta: Meta<typeof SearchResults> = {
  title: "Components/Search/SearchResults",
  component: SearchResults,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockListings: Listing[] = [
  {
    id: "1",
    category: "car",
    status: "active",
    seller_id: "seller1",
    dealer_id: "dealer1",
    make: "BMW",
    model: "X1",
    year: 2024,
    price: 7300000,
    currency: "Ksh",
    mileage: 72491,
    body_type: "SUV",
    transmission: "Automatic",
    fuel_type: "Diesel",
    color: "White",
    condition: "foreign_used",
    seats: null,
    doors: null,
    drive_type: null,
    description: "Great car",
    features: [],
    metadata: {},
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dealer: {
      id: "dealer1",
      name: "Kathryn Murphy",
      logo_url: null,
      city: "Nairobi",
    },
    images: [
      {
        id: "img1",
        listing_id: "1",
        r2_key: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=450&fit=crop",
        alt_text: "BMW",
        image_order: 1,
        is_watermarked: false,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "2",
    category: "car",
    status: "active",
    seller_id: "seller2",
    dealer_id: null,
    make: "Toyota",
    model: "Prado",
    year: 2023,
    price: 9500000,
    currency: "Ksh",
    mileage: 28000,
    body_type: "SUV",
    transmission: "Automatic",
    fuel_type: "Diesel",
    color: "Black",
    condition: "locally_used",
    seats: null,
    doors: null,
    drive_type: null,
    description: null,
    features: [],
    metadata: {},
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: {
      id: "seller2",
      full_name: "John Doe",
      avatar_url: null,
    },
    images: [],
  },
];

export const Default: Story = {
  args: {
    listings: mockListings,
    total: 45,
    totalPages: 4,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

export const Empty: Story = {
  args: {
    listings: [],
    total: 0,
    totalPages: 0,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};
