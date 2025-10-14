import { ProductCategory, Product, SiteImages } from './types';

export const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Power Tiller - Model A',
    category: ProductCategory.PowerTiller,
    image: 'https://images.unsplash.com/photo-1621237191147-4f40f437af13?q=80&w=2070&auto=format&fit=crop',
    description: 'Experience unmatched efficiency with our high-performance power tiller, specifically designed for the demanding conditions of small to medium-sized farms. Its robust build and user-friendly operation make soil preparation a breeze.',
    specifications: {
      Engine: '7 HP Petrol',
      'Tilling Width': '24 inches',
      'Tilling Depth': '8 inches',
      Gears: '2 Forward, 1 Reverse',
    },
    price: 45000,
  },
  {
    id: 2,
    name: 'Mitsubishi Powered Brushcutter TU-43',
    category: ProductCategory.BrushCutter,
    image: 'https://images.unsplash.com/photo-1627887992985-a88b5683a6c2?q=80&w=1974&auto=format&fit=crop',
    description: 'Tackle the toughest overgrowth with this powerful and reliable brushcutter. Featuring a world-class Mitsubishi engine, it\'s engineered for heavy-duty clearing tasks, ensuring durability and peak performance.',
    specifications: {
      Power: '2.1 HP, 2 Stroke Air Cooled petrol engine',
      Displacement: '42.7cc',
      Accessories: 'Double Harness Belt, Goggles, Tool kit',
      Blades: 'Trimmer Head, 3 Teeth Metal blade',
    },
    price: 12500,
  },
  {
    id: 3,
    name: 'Honda Powered Brushcutter GX-35',
    category: ProductCategory.BrushCutter,
    image: 'https://images.unsplash.com/photo-1615273529323-2559a45c71a3?q=80&w=2070&auto=format&fit=crop',
    description: 'Achieve a pristine finish with this efficient side-pack brushcutter. Powered by a dependable Honda 4-stroke engine, it offers smooth operation and lower emissions, making it ideal for both professional landscapers and homeowners.',
    specifications: {
      Power: '1.3 HP, 4 Stroke Air Cooled petrol engine',
      Displacement: '35.8cc',
      Accessories: 'Double Harness Belt, Goggles, Tool kit',
      Blades: 'Trimmer Head, 2 Teeth Metal blade',
    },
    price: 15000,
  },
  {
    id: 4,
    name: 'Riga-Italy Side Pack Brushcutter CG-400',
    category: ProductCategory.BrushCutter,
    image: 'https://images.unsplash.com/photo-1543786938-c6252a65f57a?q=80&w=2070&auto=format&fit=crop',
    description: 'Unleash professional-grade power with this high-performance brushcutter. Integrating superior Italian technology, it is designed for maximum durability, efficiency, and comfort during extended use.',
    specifications: {
      Power: '2.6 HP, 2 Stroke Air Cooled Petrol Engine',
      Displacement: '56 CC',
      Accessories: 'Double Harness Belt, Goggles, Tool kit',
      Blades: 'Trimmer Head, 3 Teeth Metal blade',
    },
    price: 18000,
  },
  {
    id: 5,
    name: 'Power Tiller - Model B (Green)',
    category: ProductCategory.PowerTiller,
    image: 'https://images.unsplash.com/photo-1598319208911-30953a7b68de?q=80&w=2070&auto=format&fit=crop',
    description: 'A versatile and powerful green power tiller equipped with multiple attachments. This all-in-one machine is perfect for a wide range of agricultural tasks, from primary tilling to inter-cultivation.',
    specifications: {
      Engine: '9 HP Diesel',
      'Tilling Width': '36 inches',
      'Tilling Depth': '10 inches',
      Gears: '3 Forward, 1 Reverse',
    },
    price: 75000,
  },
  {
    id: 6,
    name: 'LEO Earth Auger GX-50',
    category: ProductCategory.EarthAuger,
    image: 'https://images.unsplash.com/photo-1599493326107-cc66754b220a?q=80&w=1935&auto=format&fit=crop',
    description: 'Dig with precision and ease using this Honda-powered earth auger. It is the ideal tool for digging holes for fencing, tree planting, and construction projects, delivering reliability and power when you need it most.',
    specifications: {
      Engine: 'Single cylinder, OHC petrol engine',
      Displacement: '50 CC',
      'Net power': '1.47 kW (2.0 HP) / 7000 rpm',
      'Drill Bit Optional': '80mm, 100mm, 125mm, 150mm, 200mm',
    },
    price: 22000,
  },
  {
    id: 7,
    name: 'LEO Cordless Chain Saw',
    category: ProductCategory.Chainsaw,
    image: 'https://images.unsplash.com/photo-1611094504499-563d0aa78a2d?q=80&w=2070&auto=format&fit=crop',
    description: 'Enjoy the freedom of a lightweight and powerful cordless chainsaw. Perfect for easy trimming, pruning, and cutting firewood without the hassle of cords or gasoline.',
    specifications: {
      'Battery Power': '900w',
      'Battery Capacity': '3000mah',
      Voltage: '21v',
      'Chain Speed': '6m/s',
      'Guide Bar Length': '12 inch',
    },
    price: 8500,
  },
  {
      id: 8,
      name: 'Power Weeder 212cc',
      category: ProductCategory.PowerTiller,
      image: 'https://images.unsplash.com/photo-1625805113883-7a6b5a34e4f6?q=80&w=1974&auto=format&fit=crop',
      description: 'Boost your farm\'s productivity with this robust 212cc power weeder. It provides excellent performance for soil preparation, weed removal, and inter-cultivation in large fields and gardens.',
      specifications: {
        Engine: '212cc OHV',
        Power: '7.5 HP',
        Fuel: 'Petrol',
        Blades: 'Hardened Steel',
      },
      price: 52000,
  }
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
  logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-M9yisP_o1K_aD4c5p-3c_8Xk2Y2s7vQ_g&s',
  hero: 'https://images.unsplash.com/photo-1492944436997-a6dc1556066d?q=80&w=2070&auto=format&fit=crop',
  about: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1974&auto=format&fit=crop',
  qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example',
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