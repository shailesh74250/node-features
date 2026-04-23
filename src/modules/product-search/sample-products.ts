import { ProductDocument } from './product-search.types';

export const sampleProducts: ProductDocument[] = [
  {
    id: 'P-1001',
    name: 'Apple iPhone 15 Pro',
    description:
      '6.1-inch display, A17 Pro chip, and advanced triple camera system.',
    category: 'Smartphones',
    brand: 'Apple',
    tags: ['iphone', 'ios', '5g', 'premium'],
    price: 999,
    inStock: true,
  },
  {
    id: 'P-1002',
    name: 'Samsung Galaxy S24 Ultra',
    description:
      'Flagship Android phone with AI features, S Pen, and pro-grade camera.',
    category: 'Smartphones',
    brand: 'Samsung',
    tags: ['android', 'galaxy', '5g', 'stylus'],
    price: 1199,
    inStock: true,
  },
  {
    id: 'P-1003',
    name: 'Sony WH-1000XM5 Headphones',
    description:
      'Industry-leading noise cancellation with rich audio and long battery life.',
    category: 'Audio',
    brand: 'Sony',
    tags: ['wireless', 'headphones', 'noise cancellation', 'bluetooth'],
    price: 399,
    inStock: true,
  },
  {
    id: 'P-1004',
    name: 'Dell XPS 13 Laptop',
    description:
      'Compact ultrabook with Intel Core processor and InfinityEdge display.',
    category: 'Laptops',
    brand: 'Dell',
    tags: ['ultrabook', 'windows', 'portable'],
    price: 1299,
    inStock: true,
  },
  {
    id: 'P-1005',
    name: 'Nike Air Zoom Pegasus 40',
    description:
      'Responsive running shoes designed for daily training and comfort.',
    category: 'Footwear',
    brand: 'Nike',
    tags: ['running', 'sports', 'shoes'],
    price: 130,
    inStock: false,
  },
  {
    id: 'P-1006',
    name: 'Adidas Essentials Hoodie',
    description: 'Soft fleece hoodie for casual wear and light workouts.',
    category: 'Apparel',
    brand: 'Adidas',
    tags: ['hoodie', 'casual', 'sportswear'],
    price: 65,
    inStock: true,
  },
  {
    id: 'P-1007',
    name: 'Canon EOS R50 Camera',
    description:
      'Mirrorless camera with 4K video and smart autofocus for creators.',
    category: 'Cameras',
    brand: 'Canon',
    tags: ['camera', 'mirrorless', 'photography', '4k'],
    price: 679,
    inStock: true,
  },
  {
    id: 'P-1008',
    name: 'Logitech MX Master 3S Mouse',
    description:
      'Ergonomic wireless mouse with precise tracking and silent clicks.',
    category: 'Accessories',
    brand: 'Logitech',
    tags: ['mouse', 'productivity', 'wireless'],
    price: 99,
    inStock: true,
  },
];
