export const SAMPLE_USER = {
  id: "u-ada",
  name: "Ada Lovelace",
  email: "ada@test.com",
  role: "freelancer",
};

export const SAMPLE_GIGS = [
  {
    id: "g-1",
    title: "Brand identity starter pack",
    description:
      "Logo, colour palette, and a one-page brand guide for a small business. Two revision rounds included. Files delivered as PNG, SVG, and PDF.",
    category: "Design",
    price: 850,
    freelancerId: "u-ada",
    freelancerName: "Ada Lovelace",
  },
  {
    id: "g-2",
    title: "Landing page in 5 days",
    description:
      "A fast, mobile-first landing page with a contact form and basic SEO setup. Copy can be supplied or drafted together.",
    category: "Development",
    price: 1200,
    freelancerId: "u-ada",
    freelancerName: "Ada Lovelace",
  },
  {
    id: "g-3",
    title: "Ten social captions",
    description:
      "A week of captions for Instagram or LinkedIn in your voice. Includes hashtag suggestions and a posting order.",
    category: "Writing",
    price: 400,
    freelancerId: "u-chen",
    freelancerName: "Chen Jacobs",
  },
  {
    id: "g-4",
    title: "Product photo retouch (5 images)",
    description:
      "Clean background, colour match, and light sharpening for shop listings. RAW files welcome.",
    category: "Photography",
    price: 650,
    freelancerId: "u-chen",
    freelancerName: "Chen Jacobs",
  },
];

export const SAMPLE_BOOKINGS = [
  {
    id: "b-1",
    gigId: "g-1",
    gigTitle: "Brand identity starter pack",
    status: "pending",
    amount: 850,
    clientId: "u-client",
    freelancerId: "u-ada",
    createdAt: "2026-09-18T10:00:00.000Z",
  },
  {
    id: "b-2",
    gigId: "g-3",
    gigTitle: "Ten social captions",
    status: "confirmed",
    amount: 400,
    clientId: "u-client",
    freelancerId: "u-ada",
    createdAt: "2026-09-12T10:00:00.000Z",
  },
];

export const SAMPLE_TRANSACTIONS = [
  {
    id: "t-1",
    bookingId: "b-2",
    gigId: "g-3",
    gigTitle: "Ten social captions",
    amount: 400,
    type: "booking",
    createdAt: "2026-09-12T10:05:00.000Z",
  },
  {
    id: "t-2",
    bookingId: "b-0",
    gigId: "g-2",
    gigTitle: "Landing page in 5 days",
    amount: 1200,
    type: "booking",
    createdAt: "2026-08-29T09:00:00.000Z",
  },
];

export const SAMPLE_TOTAL_INCOME = 1600;
