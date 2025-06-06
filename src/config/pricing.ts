export type CleaningType = "standard" | "deep" | "move-in/out" | "airbnb";
export type Bedrooms = 1 | 2 | 3 | 4;
export type Bathrooms = 1 | 2 | 3;

export interface PricingMatrix {
  [key: string]: { // Key format: "bedrooms-bathrooms" e.g. "1-1"
    standard: number;
    deep: number;
    "move-in/out": number;
    airbnb: number;
  };
}

export const basePrices: PricingMatrix = {
  "1-1": { standard: 100, deep: 160, "move-in/out": 150, airbnb: 120 },
  "1-2": { standard: 120, deep: 190, "move-in/out": 180, airbnb: 140 },
  "1-3": { standard: 140, deep: 220, "move-in/out": 210, airbnb: 160 },
  "2-1": { standard: 130, deep: 220, "move-in/out": 200, airbnb: 150 },
  "2-2": { standard: 150, deep: 250, "move-in/out": 230, airbnb: 170 },
  "2-3": { standard: 170, deep: 280, "move-in/out": 260, airbnb: 190 },
  "3-1": { standard: 160, deep: 280, "move-in/out": 250, airbnb: 180 },
  "3-2": { standard: 180, deep: 310, "move-in/out": 280, airbnb: 200 },
  "3-3": { standard: 200, deep: 340, "move-in/out": 310, airbnb: 220 },
  "4-1": { standard: 190, deep: 340, "move-in/out": 300, airbnb: 210 },
  "4-2": { standard: 220, deep: 370, "move-in/out": 340, airbnb: 250 },
  "4-3": { standard: 250, deep: 400, "move-in/out": 380, airbnb: 290 },
};

export const addOnOptions = [
  { id: "fridge", label: "Fridge Cleaning", price: 25 },
  { id: "oven", label: "Oven Cleaning", price: 25 },
  { id: "cabinets", label: "Inside Cabinets", price: 25 },
  { id: "windows", label: "Inside Windows", price: 30 },
  { id: "linen", label: "Linen Change", price: 20 },
  { id: "laundry", label: "Laundry Service", price: 30 },
  { id: "petHair", label: "Pet Hair Removal", price: 30 },
] as const;

export type AddOnId = typeof addOnOptions[number]['id'];

export const addOnPrices: Record<AddOnId, number> = addOnOptions.reduce((acc, curr) => {
  acc[curr.id] = curr.price;
  return acc;
}, {} as Record<AddOnId, number>);

export const cleaningTypeOptions: { value: CleaningType; label: string }[] = [
  { value: "standard", label: "Standard Cleaning" },
  { value: "deep", label: "Deep Cleaning" },
  { value: "move-in/out", label: "Move-In/Out Cleaning" },
  { value: "airbnb", label: "Airbnb Cleaning" },
];

export const bedroomOptions: { value: Bedrooms; label: string }[] = [
  { value: 1, label: "1 Bedroom" },
  { value: 2, label: "2 Bedrooms" },
  { value: 3, label: "3 Bedrooms" },
  { value: 4, label: "4 Bedrooms" },
];

export const bathroomOptions: { value: Bathrooms; label: string }[] = [
  { value: 1, label: "1 Bathroom" },
  { value: 2, label: "2 Bathrooms" },
  { value: 3, label: "3 Bathrooms" },
];
