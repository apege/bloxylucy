export interface RobuxItem {
  id: string;
  amount: number;
  bonus?: number;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  isPromo?: boolean;
}

export interface Testimonial {
  id: string;
  username: string;
  rating: number;
  robuxPackage: string;
  comment: string;
  timeAgo: string;
  avatarLetter: string;
  hasProof?: boolean;
  proofAmount?: string;
  adminReply?: {
    adminName: string;
    message: string;
  };
}

export const ROBUX_PRICELIST: RobuxItem[] = [
  { id: 'rbx-1800', amount: 1800, price: 35000, isPromo: true },
  { id: 'rbx-2200', amount: 2200, price: 45000, isPopular: true },
  { id: 'rbx-2700', amount: 2700, price: 50000 },
  { id: 'rbx-3200', amount: 3200, price: 60000 },
  { id: 'rbx-3700', amount: 3700, price: 70000 },
  { id: 'rbx-4200', amount: 4200, price: 80000 },
  { id: 'rbx-4700', amount: 4700, price: 90000 },
  { id: 'rbx-5500', amount: 5500, price: 100000, isPopular: true },
  { id: 'rbx-10500', amount: 10500, price: 200000, isBestValue: true },
  { id: 'rbx-15500', amount: 15500, price: 300000 },
  { id: 'rbx-20500', amount: 20500, price: 400000 },
  { id: 'rbx-30500', amount: 30500, price: 500000, isBestValue: true },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    username: 'Tengkurap420',
    rating: 5,
    robuxPackage: '10.500 Robux',
    comment: '200k dapet masuk cmn 7 mnit uyyyyy, seller ramah banget mantul pol! Next order lagi disini langganan.',
    timeAgo: '10 menit yang lalu',
    avatarLetter: 'T',
    hasProof: true,
    proofAmount: '11.4K',
    adminReply: {
      adminName: 'Admin BloxyLucy Official',
      message: 'Makasih banyak kak sudah order di BloxyLucy! Ditunggu orderan sultan berikutnya yaa 💖✨',
    },
  },
  {
    id: 't-2',
    username: 'QueenRoblox99',
    rating: 5,
    robuxPackage: '5.500 Robux',
    comment: 'Awalnya ragu karena murah banget, ternyata beneran fast respon cuma 5 menit langsung mendarat robuxnya! Recommended bgt 💕',
    timeAgo: '35 menit yang lalu',
    avatarLetter: 'Q',
    hasProof: true,
    proofAmount: '5.8K',
    adminReply: {
      adminName: 'Admin BloxyLucy Official',
      message: 'Sama-sama kakk! Kepuasan kalian prioritas kami 🥰',
    },
  },
  {
    id: 't-3',
    username: 'Alif_BloxGamer',
    rating: 5,
    robuxPackage: '30.500 Robux',
    comment: 'Beli paket sultan 30.5k robux buat game pass Blox Fruits, proses kilat ga pake ribet cuma username aja. Mantappp 🔥',
    timeAgo: '2 jam yang lalu',
    avatarLetter: 'A',
    hasProof: true,
    proofAmount: '32.1K',
    adminReply: {
      adminName: 'Admin BloxyLucy Official',
      message: 'Wah mantap selamat borong game pass nya ya kakk! 👑🎉',
    },
  },
];
