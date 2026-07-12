import type { LanguageCode } from "./i18n";

export type Role = "farmer" | "admin";

export interface User {
  id: string; // Firebase Auth UID
  fullName: string;
  email: string;
  mobile: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface FarmerProfile {
  id: string; // Document ID
  userId: string;
  state?: string | null;
  district?: string | null;
  village?: string | null;
  preferredLanguage?: string | null;
  farmSize?: number | null;
  soilType?: string | null;
  irrigationMethod?: string | null;
  mainCrops?: string[] | null;
  farmingExperience?: number | null;
  annualIncome?: number | null;
  farmingGoals?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  messages: Array<{ role: "user" | "assistant"; content: string; createdAt?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiseaseReport {
  id: string;
  userId: string;
  crop: string;
  symptoms?: string | null;
  imagePath?: string | null;
  diagnosis?: any | null;
  createdAt: Date;
}

export interface CropRecommendation {
  id: string;
  userId: string;
  inputs?: any | null;
  recommendations?: any | null;
  createdAt: Date;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary?: string | null;
  content: string;
  imageUrl?: string | null;
  author?: string | null;
  publishedAt: Date;
  createdAt: Date;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility?: string | null;
  benefits?: string | null;
  requiredDocuments?: string | null;
  applicationProcess?: string | null;
  ministry?: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId?: string | null; // null for global notifications
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  category: string;
  amount: number;
  description?: string | null;
  date: Date;
  createdAt: Date;
}

export interface Income {
  id: string;
  userId: string;
  category: string;
  amount: number;
  description?: string | null;
  date: Date;
  createdAt: Date;
}

export interface MarketPrice {
  id: string;
  crop: string;
  market: string;
  price: number;
  unit: string;
  date: Date;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  userId: string;
  message: string;
  rating?: number | null;
  createdAt: Date;
}

export interface AiUsage {
  id: string;
  userId: string;
  endpoint: string;
  model?: string | null;
  tokens?: number | null;
  createdAt: Date;
}
