// import { useEffect, useState } from 'react';
// import { ADS } from '../config/ads';

// interface AdSlideshowProps {
//   onClose?: () => void;
// }

// export default function AdSlideshow({ onClose }: AdSlideshowProps) {
//   const [currentAdIndex, setCurrentAdIndex] = useState(0);

//   useEffect(() => {
//     if (ADS.length === 0) return;

//     // 10초마다 광고 변경
//     const slideTimer = setInterval(() => {
//       setCurrentAdIndex((prev) => (prev + 1) % ADS.length);
//     }, 10000);

//     return () => clearInterval(slideTimer);
//   }, []);

//   const currentAd = ADS[currentAdIndex];

//   const handleClose = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     onClose?.();
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-40"
//       onClick={handleClose}
//     >
//       <div
//         className="w-[100vh] h-[100vw] -rotate-90 origin-center bg-black flex flex-col items-center justify-center cursor-pointer"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* 광고 이미지 */}
//         <div
//           className="w-[90%] h-[90%] flex items-center justify-center px-4"
//           onClick={handleClose}
//         >
//           <img
//             src={currentAd.image}
//             alt="advertisement"
//             className="w-full h-full object-contain rounded-2xl"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
