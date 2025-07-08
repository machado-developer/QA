// types/quadra.ts
export type Quadra = {
  id: string;
  name: string;
  address: string;
  featuredImage: string;
  rating: number;
    category?: {
        id: string,
        name: string
    }[];
    courtImages: { id: string; courtId: string; userId: string | null; url: string; createdAt: string; }[],

  pricePerHour: number;
};
