import { ProductCategory, Product, SiteImages } from './types';
import heroImageFile from './image/hero.png';
import logoImageFile from './image/logo.jpg';
import qrCodeImageFile from './image/qr code.jpg';
import product1Image from './image/product1.png';
import product2Image from './image/product2.png';
import product3Image from './image/product3.png';
import product4Image from './image/product4.png';
import product5Image from './image/product5.png';
import product6Image from './image/product6.png';

export const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Mitsubishi Powered Brushcutter - TU-43',
    category: ProductCategory.BrushCutter,
    image: product1Image,
    description: 'Reliable Mitsubishi-powered TU-43 brushcutter for tough clearing tasks with strong performance and durability.',
    specifications: {
      Power: '2 Stroke, Air Cooled',
      Notes: 'Mitsubishi TU-43 engine',
    },
    price: 12500,
  },
  {
    id: 2,
    name: 'Riga-Italy Side Pack Brushcutter CG-400',
    category: ProductCategory.BrushCutter,
    image: product2Image,
    description: 'Italian technology CG-400 side-pack brushcutter for professional performance and comfort.',
    specifications: {
      Power: '2.6 HP, 2 Stroke Air Cooled Petrol Engine',
      Displacement: '56 CC',
      Accessories: 'Double Harness Belt, Googles, Tool kit',
      Blades: 'Trimmer Head, 3 Teeth Metal Blade',
    },
    price: 18000,
  },
  {
    id: 3,
    name: 'Leo Side Pack Brushcutter Model GX-35',
    category: ProductCategory.BrushCutter,
    image: product3Image,
    description: 'Leo GX-35 side-pack brushcutter with smooth 4-stroke operation and low emissions.',
    specifications: {
      Power: '1.3 HP, 4 Stroke Air cooled petrol engine',
      Displacement: '35.8 cc',
      Accessories: 'Double Harness Belt, Googles, Gloves, Tool kit',
      Blades: 'Trimmer Head, 3 T Blade, 80 Teeth Blade',
    },
    price: 15000,
  },
  {
    id: 4,
    name: 'Leo Cordless Chain Saw',
    category: ProductCategory.Chainsaw,
    image: product4Image,
    description: 'Lightweight cordless chain saw with high battery power and smooth cutting performance.',
    specifications: {
      'Battery Power': '900w',
      'Battery Capacity': '3000mah',
      Voltage: '21v',
      'Chain Speed': '6m/s',
      'Guide Bar Length': '12 inch',
    },
    price: 18000,
  },
  {
    id: 5,
    name: 'Honda Powered Brushcutter Side Pack GX-35',
    category: ProductCategory.BrushCutter,
    image: product5Image,
    description: 'Honda GX-35 side-pack brushcutter for efficient trimming with dependable 4-stroke engine.',
    specifications: {
      Power: '1.3 HP, 4 Stroke Air cooled petrol engine',
      Displacement: '35.8 cc',
      Accessories: 'Double Harness Belt, Googles, Tool kit',
      Blades: 'Trimmer Head, 2 Teeth Metal blade',
    },
    price: 15000,
  },
  {
    id: 6,
    name: 'Leo Earth Auger GX-50',
    category: ProductCategory.EarthAuger,
    image: product6Image,
    description: 'High-performance earth auger for precise digging with reliable OHC petrol engine.',
    specifications: {
      Engine: 'Single cylinder, OHC petrol engine',
      Displacement: '50 CC',
      'Net power': '1.47 kW (2.0 HP) / 7000 rpm',
      'Drill Bit Optional': '80mm, 100mm, 125mm, 150mm, 200mm',
      'Fuel Tank Capacity': '0.63 Liter',
      'Engine OIL Capacity': '0.13 Liter',
      'G.WEIGHT / N.Weight': '12/10kgs',
    },
    price: 22000,
  },
  
];

export const categories = [
  ProductCategory.All,
  ProductCategory.PowerTiller,
  ProductCategory.BrushCutter,
  ProductCategory.EarthAuger,
  ProductCategory.Chainsaw,
];

export const contactDetails = {
    mobile: '7726017648',
    email: 'ratanagritech@gmail.com',
    address: 'Jagmalpura, Sikar (Raj.)'
}

export const initialSiteImages: SiteImages = {
  logo: logoImageFile,
  hero: heroImageFile,
  about: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1974&auto=format&fit=crop',
  qrCode: qrCodeImageFile,
};

export const chatbotQA = [
  {
    keywords: ['hello', 'hi', 'hey', 'greeting'],
    response: 'Hello! Welcome to Ratan Agri Tech. How can I assist you today?'
  },
  {
    keywords: ['product', 'machine', 'equipment', 'types'],
    response: 'We offer a wide range of agricultural machinery including Power Tillers, Brush Cutters, Earth Augers, and Chainsaws. Which product are you interested in?'
  },
  {
    keywords: ['power tiller', 'weeder'],
    response: 'Our Power Tillers are robust and designed for high performance in various soil conditions. They are perfect for tilling, weeding, and preparing seedbeds. Would you like to know the specifications?'
  },
  {
    keywords: ['brush cutter'],
    response: 'We have several models of Brush Cutters, including reliable options powered by Mitsubishi and Honda engines. They are ideal for clearing tough grass, weeds, and small bushes.'
  },
  {
    keywords: ['earth auger'],
    response: 'Our Earth Augers are perfect for digging precise holes for planting, fencing, or construction. The LEO Earth Auger GX-50 is a popular choice, powered by a Honda engine.'
  },
  {
    keywords: ['chainsaw'],
    response: 'The LEO Cordless Chainsaw is a lightweight yet powerful tool for trimming branches and cutting wood. Its battery-powered design offers great portability.'
  },
  {
    keywords: ['contact', 'phone', 'number', 'email', 'address'],
    response: `You can reach us via mobile at +91 ${contactDetails.mobile}, or email us at ${contactDetails.email}. Our address is ${contactDetails.address}.`
  },
  {
    keywords: ['quote', 'price', 'cost'],
    response: 'For the latest prices and a detailed quote, please contact our sales team directly at +91 7726017648 or ratanagritech@gmail.com. They will be happy to assist you.'
  },
  {
    keywords: ['bye', 'thanks', 'thank you'],
    response: 'You\'re welcome! Thank you for your interest in Ratan Agri Tech. Have a great day!'
  },
  {
    keywords: ['fallback'],
    response: 'I\'m sorry, I\'m not sure how to answer that. For detailed inquiries, please contact us directly at +91 7726017648. How else can I help you?'
  }
];