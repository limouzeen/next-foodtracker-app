// app/lib/mockFoods.ts
import { StaticImageData } from 'next/image';

// ปรับ path ให้ตรงโปรเจ็กต์ (จาก lib -> images อยู่ที่ ../images)
import foodA from '../images/food.jpg';
import foodB from '../images/foodbanner.jpg';
import foodC from '../images/profile.jpg';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
export type FoodItem = {
  id: number;
  date: string;             // ISO yyyy-mm-dd
  image: StaticImageData;
  name: string;
  meal: MealType;
};

export const MOCK_FOODS: FoodItem[] = [
  { id: 1,  date: '2025-09-01', image: foodA, name: 'Grilled Chicken Salad', meal: 'Lunch' },
  { id: 2,  date: '2025-09-01', image: foodB, name: 'Oatmeal & Berries',    meal: 'Breakfast' },
  { id: 3,  date: '2025-09-01', image: foodC, name: 'Protein Smoothie',      meal: 'Snack' },
  { id: 4,  date: '2025-09-02', image: foodA, name: 'Salmon Teriyaki',       meal: 'Dinner' },
  { id: 5,  date: '2025-09-02', image: foodB, name: 'Caesar Wrap',           meal: 'Lunch' },
  { id: 6,  date: '2025-09-02', image: foodC, name: 'Greek Yogurt',          meal: 'Breakfast' },
  { id: 7,  date: '2025-09-03', image: foodA, name: 'Avocado Toast',         meal: 'Breakfast' },
  { id: 8,  date: '2025-09-03', image: foodB, name: 'Sushi Set',             meal: 'Dinner' },
  { id: 9,  date: '2025-09-03', image: foodC, name: 'Chicken Pad Thai',      meal: 'Lunch' },
  { id:10,  date: '2025-09-04', image: foodA, name: 'Pumpkin Soup',          meal: 'Dinner' },
  { id:11,  date: '2025-09-04', image: foodB, name: 'Mango Sticky Rice',     meal: 'Snack' },
  { id:12,  date: '2025-09-04', image: foodC, name: 'Beef Bowl',             meal: 'Lunch' },
  { id:13,  date: '2025-09-05', image: foodA, name: 'Pancakes',              meal: 'Breakfast' },
  { id:14,  date: '2025-09-05', image: foodB, name: 'Tom Yum Soup',          meal: 'Dinner' },
];

export function getFoodById(id: number): FoodItem | null {
  return MOCK_FOODS.find(x => x.id === id) ?? null;
}
