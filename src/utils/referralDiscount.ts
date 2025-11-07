import { supabase } from "@/integrations/supabase/client";

interface ReferralDiscount {
  hasDiscount: boolean;
  discountPercentage: number;
  discountAmount: number;
}

/**
 * Check if user has an unused referral discount and calculate it
 * @param userId - The user's ID
 * @param orderTotal - The order total amount before discount
 * @returns Object containing discount information
 */
export async function checkReferralDiscount(
  userId: string,
  orderTotal: number
): Promise<ReferralDiscount> {
  try {
    // Check if user was referred and hasn't used their discount yet
    const { data: referralData, error } = await supabase
      .from("referrals")
      .select("discount_used, referrer_id")
      .eq("referred_id", userId)
      .eq("discount_used", false)
      .single();

    if (error || !referralData) {
      return {
        hasDiscount: false,
        discountPercentage: 0,
        discountAmount: 0,
      };
    }

    // Calculate 10% discount
    const discountPercentage = 10;
    const discountAmount = (orderTotal * discountPercentage) / 100;

    return {
      hasDiscount: true,
      discountPercentage,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimals
    };
  } catch (error) {
    console.error("Error checking referral discount:", error);
    return {
      hasDiscount: false,
      discountPercentage: 0,
      discountAmount: 0,
    };
  }
}

/**
 * Mark the referral discount as used after order is placed
 * @param userId - The user's ID
 * @param discountAmount - The discount amount that was applied
 */
export async function markReferralDiscountUsed(
  userId: string,
  discountAmount: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("referrals")
      .update({
        discount_used: true,
        discount_amount: discountAmount,
      })
      .eq("referred_id", userId)
      .eq("discount_used", false);

    if (error) {
      console.error("Error marking referral discount as used:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking referral discount as used:", error);
    return false;
  }
}

/**
 * Check if referrer has unused discount (from successful referrals)
 * @param userId - The referrer's user ID
 * @param orderTotal - The order total amount
 * @returns Discount information
 */
export async function checkReferrerDiscount(
  userId: string,
  orderTotal: number
): Promise<ReferralDiscount> {
  try {
    // Check if user has referred someone who signed up
    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("discount_used")
      .eq("referrer_id", userId)
      .eq("discount_used", false)
      .limit(1);

    if (error || !referrals || referrals.length === 0) {
      return {
        hasDiscount: false,
        discountPercentage: 0,
        discountAmount: 0,
      };
    }

    // Calculate 10% discount
    const discountPercentage = 10;
    const discountAmount = (orderTotal * discountPercentage) / 100;

    return {
      hasDiscount: true,
      discountPercentage,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  } catch (error) {
    console.error("Error checking referrer discount:", error);
    return {
      hasDiscount: false,
      discountPercentage: 0,
      discountAmount: 0,
    };
  }
}
