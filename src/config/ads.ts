export const ADS = [
  { id: 1, image: '/ads/ad-1.jpg', ageMin: 50 },
  { id: 2, image: '/ads/ad-2.jpg', ageMin: 20, ageMax: 49 },
  { id: 3, image: '/ads/ad-3.jpg', ageMax: 19 },
];

export const getRandomAd = () => {
  return ADS[Math.floor(Math.random() * ADS.length)];
};
