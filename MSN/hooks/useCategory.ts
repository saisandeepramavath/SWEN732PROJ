import React from 'react';
import { Ionicons } from '@expo/vector-icons';

// ✅ STEP 1: Expanded and precise training data
const trainingData = [
  // Food
  { title: 'Dominos Pizza', category: 'food' },
  { title: 'Starbucks Coffee', category: 'food' },
  { title: 'Subway sandwich', category: 'food' },
  { title: 'Grocery shopping', category: 'food' },
  { title: 'Lunch at cafe', category: 'food' },
  { title: 'Snacks and beverages', category: 'food' },

  // Shopping
  { title: 'Amazon order', category: 'shopping' },
  { title: 'Zara clothes', category: 'shopping' },
  { title: 'Shopping at Walmart', category: 'shopping' },
  { title: 'Target groceries', category: 'shopping' },
  { title: 'Clothing and shoes', category: 'shopping' },

  // Transport
  { title: 'Uber ride', category: 'transport' },
  { title: 'Ola cab', category: 'transport' },
  { title: 'Train ticket', category: 'transport' },
  { title: 'Flight to Mumbai', category: 'transport' },
  { title: 'Petrol for car', category: 'transport' },
  { title: 'Fuel station bill', category: 'transport' },
  { title: 'Car maintenance', category: 'transport' },

  // Utilities
  { title: 'Electricity bill', category: 'utilities' },
  { title: 'Water bill', category: 'utilities' },
  { title: 'Internet recharge', category: 'utilities' },
  { title: 'WiFi payment', category: 'utilities' },
  { title: 'Mobile phone recharge', category: 'utilities' },
  { title: 'Gas pipeline bill', category: 'utilities' },

  // Health
  { title: 'Doctor consultation', category: 'health' },
  { title: 'Pharmacy medicine', category: 'health' },
  { title: 'Hospital charges', category: 'health' },
  { title: 'Dental appointment', category: 'health' },
  { title: 'Eye checkup', category: 'health' },

  // Fitness
  { title: 'Gym membership', category: 'fitness' },
  { title: 'Yoga class', category: 'fitness' },
  { title: 'Protein supplements', category: 'fitness' },

  // Education
  { title: 'Tuition fee', category: 'education' },
  { title: 'Books and notebooks', category: 'education' },
  { title: 'Online course', category: 'education' },
  { title: 'Exam registration', category: 'education' },

  // Housing
  { title: 'Monthly rent', category: 'housing' },
  { title: 'Airbnb booking', category: 'housing' },
  { title: 'Apartment deposit', category: 'housing' },

  // Subscriptions
  { title: 'Netflix subscription', category: 'subscription' },
  { title: 'Spotify plan', category: 'subscription' },
  { title: 'Adobe Creative Cloud', category: 'subscription' },

  // Gifts
  { title: 'Birthday gift', category: 'gifts' },
  { title: 'Wedding present', category: 'gifts' },

  // Travel
  { title: 'Thailand vacation', category: 'travel' },
  { title: 'Hotel booking', category: 'travel' },
  { title: 'Travel insurance', category: 'travel' },

  // Donation
  { title: 'Temple donation', category: 'donation' },
  { title: 'Fundraiser contribution', category: 'donation' },
];

// ✅ STEP 2: Keyword-synonym map (for better matching)
const keywordMap: Record<string, string> = {
  petrol: 'fuel',
  gas: 'fuel',
  electricity: 'utilities',
  internet: 'utilities',
  wifi: 'utilities',
  recharge: 'utilities',
  doctor: 'health',
  medicine: 'health',
  hospital: 'health',
  train: 'transport',
  cab: 'transport',
  car: 'transport',
  uber: 'transport',
  ola: 'transport',
};

// ✅ STEP 3: Index for scoring
const keywordsByCategory = trainingData.reduce((acc, item) => {
  const words = item.title.toLowerCase().split(/\s+/);
  if (!acc[item.category]) acc[item.category] = new Set();
  words.forEach(word => acc[item.category].add(word));
  return acc;
}, {} as Record<string, Set<string>>);

// ✅ STEP 4: Scoring + keyword override classifier
const predictCategory = (title: string): string => {
  const originalWords = title.toLowerCase().split(/\s+/);
  const words = originalWords.map(word => keywordMap[word] || word);
  const scores: Record<string, number> = {};

  for (const category in keywordsByCategory) {
    scores[category] = 0;
    words.forEach(word => {
      if (keywordsByCategory[category].has(word)) {
        scores[category] += 1;
      }
    });
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best?.[0] || 'others';
};

// ✅ STEP 5: Icon Mapping
const categoryIcons: Record<string, JSX.Element> = {
  food: React.createElement(Ionicons, { name: "fast-food-outline", size: 24, color: "#555" }),
  shopping: React.createElement(Ionicons, { name: "cart-outline", size: 24, color: "#555" }),
  transport: React.createElement(Ionicons, { name: "car-outline", size: 24, color: "#555" }),
  entertainment: React.createElement(Ionicons, { name: "game-controller-outline", size: 24, color: "#555" }),
  utilities: React.createElement(Ionicons, { name: "flash-outline", size: 24, color: "#555" }),
  health: React.createElement(Ionicons, { name: "medkit-outline", size: 24, color: "#555" }),
  fitness: React.createElement(Ionicons, { name: "barbell-outline", size: 24, color: "#555" }),
  education: React.createElement(Ionicons, { name: "school-outline", size: 24, color: "#555" }),
  housing: React.createElement(Ionicons, { name: "home-outline", size: 24, color: "#555" }),
  subscription: React.createElement(Ionicons, { name: "repeat-outline", size: 24, color: "#555" }),
  gifts: React.createElement(Ionicons, { name: "gift-outline", size: 24, color: "#555" }),
  donation: React.createElement(Ionicons, { name: "heart-outline", size: 24, color: "#555" }),
  travel: React.createElement(Ionicons, { name: "airplane-outline", size: 24, color: "#555" }),
  others: React.createElement(Ionicons, { name: "help-circle-outline", size: 24, color: "#555" }),
};

// ✅ FINAL HOOK
export const useCategoryIcon = (title: string) => {
  const category = predictCategory(title);
  return {
    category,
    icon: categoryIcons[category] || categoryIcons.others,
  };
};
