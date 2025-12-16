export const ADS = [
  { id: 1, image: '/ads/ad-1.jpg' },
  { id: 2, image: '/ads/ad-2.jpg' },
  { id: 3, image: '/ads/ad-3.jpg' },
];

export const getRandomAd = () => {
  return ADS[Math.floor(Math.random() * ADS.length)];
};
