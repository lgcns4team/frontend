export type LocalAdConfig = {
  id: number;
  image: string;
  ageMin?: number;
  ageMax?: number;
};

export const ADS: LocalAdConfig[] = [
  { id: 1, image: '/ads/bakery_women_discount.png' },
  { id: 2, image: '/ads/brunch_launch.png' },
  { id: 3, image: '/ads/christmas_special.png' },
  { id: 4, image: '/ads/pocari.jpg' },
  { id: 5, image: '/ads/blackpink x pepsi.jpg' },
  { id: 6, image: '/ads/G63 Poster.jpg' },
  { id: 7, image: '/ads/new_menu_brown_sugar.png' },
  { id: 8, image: '/ads/senior_discount.png' },
  { id: 9, image: '/ads/student_discount.png' },
  { id: 10, image: '/ads/weekend_special.png' },
];

export const getRandomAd = () => {
  return ADS[Math.floor(Math.random() * ADS.length)];
};
