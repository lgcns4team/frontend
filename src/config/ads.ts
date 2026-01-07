export type LocalAdConfig = {
  id: number;
  image: string;
  ageMin?: number;
  ageMax?: number;
};

export const ADS: LocalAdConfig[] = [
  { id: 1, image: '/images/ads/bakery_women_discount.png' },
  { id: 2, image: '/images/ads/brunch_launch.png' },
  { id: 3, image: '/images/ads/christmas_special.png' },
  { id: 4, image: '/images/ads/pocari.jpg' },
  { id: 5, image: '/images/ads/blackpink_x_pepsi.jpg' },
  { id: 6, image: '/images/ads/G63_Poster.jpg' },
  { id: 7, image: '/images/ads/new_menu_brown_sugar.png' },
  { id: 8, image: '/images/ads/senior_discount.png' },
  { id: 9, image: '/images/ads/student_discount.png' },
  { id: 10, image: '/images/ads/weekend_special.png' },
];

export const getRandomAd = () => {
  return ADS[Math.floor(Math.random() * ADS.length)];
};
