export const RESTAURANT_CATEGORIES = [
  { value: 'Italienisch', label: 'Italienisch', labelEn: 'Italian' },
  { value: 'Asiatisch', label: 'Asiatisch', labelEn: 'Asian' },
  { value: 'Pizza', label: 'Pizza', labelEn: 'Pizza' },
  { value: 'Burger', label: 'Burger', labelEn: 'Burger' },
  { value: 'Sushi', label: 'Sushi', labelEn: 'Sushi' },
  { value: 'Mexikanisch', label: 'Mexikanisch', labelEn: 'Mexican' },
  { value: 'Griechisch', label: 'Griechisch', labelEn: 'Greek' },
  { value: 'Türkisch', label: 'Türkisch', labelEn: 'Turkish' },
  { value: 'Indisch', label: 'Indisch', labelEn: 'Indian' },
  { value: 'Vegetarisch', label: 'Vegetarisch', labelEn: 'Vegetarian' },
  { value: 'Vegan', label: 'Vegan', labelEn: 'Vegan' },
  { value: 'Fast Food', label: 'Fast Food', labelEn: 'Fast Food' },
  { value: 'Steakhouse', label: 'Steakhouse', labelEn: 'Steakhouse' },
  { value: 'Fisch', label: 'Fisch', labelEn: 'Seafood' },
  { value: 'Café', label: 'Café', labelEn: 'Café' },
  { value: 'Bäckerei', label: 'Bäckerei', labelEn: 'Bakery' },
  { value: 'Dessert', label: 'Dessert', labelEn: 'Dessert' },
  { value: 'Frühstück', label: 'Frühstück', labelEn: 'Breakfast' },
  { value: 'Mittagessen', label: 'Mittagessen', labelEn: 'Lunch' },
  { value: 'Abendessen', label: 'Abendessen', labelEn: 'Dinner' },
] as const;

export type RestaurantCategory = typeof RESTAURANT_CATEGORIES[number]['value'];

