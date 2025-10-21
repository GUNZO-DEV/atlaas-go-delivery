import { z } from "zod";

// Auth validation schemas
export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens, and apostrophes" }),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(128, { message: "Password must be less than 128 characters" }),
});

// Restaurant application validation schema
export const restaurantApplicationSchema = z.object({
  restaurant_name: z
    .string()
    .trim()
    .min(2, { message: "Restaurant name must be at least 2 characters" })
    .max(100, { message: "Restaurant name must be less than 100 characters" }),
  description: z
    .string()
    .trim()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional()
    .or(z.literal("")),
  cuisine_type: z
    .string()
    .trim()
    .max(100, { message: "Cuisine type must be less than 100 characters" })
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address must be less than 200 characters" }),
  phone: z
    .string()
    .trim()
    .regex(/^\+212[5-7]\d{8}$/, { 
      message: "Phone must be a valid Moroccan number (e.g., +212612345678)" 
    }),
  business_license: z
    .string()
    .trim()
    .max(50, { message: "Business license must be less than 50 characters" })
    .optional()
    .or(z.literal("")),
});

// Chat message validation
export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

// Review validation
export const reviewSchema = z.object({
  restaurant_rating: z
    .number()
    .int()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" }),
  rider_rating: z
    .number()
    .int()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" })
    .optional(),
  comment: z
    .string()
    .trim()
    .max(500, { message: "Comment must be less than 500 characters" })
    .optional()
    .or(z.literal("")),
});

// Support ticket validation
export const supportTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, { message: "Subject must be at least 3 characters" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
  priority: z.enum(["low", "medium", "high"]),
});

// Rider application validation
export const riderApplicationSchema = z.object({
  vehicle_type: z
    .string()
    .trim()
    .min(2, { message: "Vehicle type is required" })
    .max(50, { message: "Vehicle type must be less than 50 characters" }),
  vehicle_plate: z
    .string()
    .trim()
    .regex(/^[A-Z0-9-]+$/, { message: "Invalid vehicle plate format" })
    .max(20, { message: "Vehicle plate must be less than 20 characters" }),
  license_number: z
    .string()
    .trim()
    .min(5, { message: "License number must be at least 5 characters" })
    .max(50, { message: "License number must be less than 50 characters" }),
  phone: z
    .string()
    .trim()
    .regex(/^\+212[5-7]\d{8}$/, { 
      message: "Phone must be a valid Moroccan number (e.g., +212612345678)" 
    }),
  city: z
    .string()
    .trim()
    .min(2, { message: "City is required" })
    .max(100, { message: "City must be less than 100 characters" }),
});

// Wallet amount validation
export const walletAmountSchema = z.object({
  amount: z
    .number()
    .positive({ message: "Amount must be positive" })
    .max(10000, { message: "Amount exceeds maximum limit of 10,000 MAD" })
    .min(10, { message: "Minimum amount is 10 MAD" }),
});

// Emergency SOS validation
export const emergencyContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  phone: z
    .string()
    .trim()
    .regex(/^\+212[5-7]\d{8}$/, { 
      message: "Phone must be a valid Moroccan number (e.g., +212612345678)" 
    }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RestaurantApplicationInput = z.infer<typeof restaurantApplicationSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type RiderApplicationInput = z.infer<typeof riderApplicationSchema>;
export type WalletAmountInput = z.infer<typeof walletAmountSchema>;
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;
