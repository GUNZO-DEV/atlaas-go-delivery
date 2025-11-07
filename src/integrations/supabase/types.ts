export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          order_id: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          order_id: string
          sender_id: string
          sender_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_metrics: {
        Row: {
          actual_minutes: number | null
          completed_at: string | null
          created_at: string
          day_of_week: number
          distance_km: number | null
          estimated_minutes: number
          hour_of_day: number
          id: string
          order_id: string
          restaurant_id: string
          weather_condition: string | null
        }
        Insert: {
          actual_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          day_of_week: number
          distance_km?: number | null
          estimated_minutes: number
          hour_of_day: number
          id?: string
          order_id: string
          restaurant_id: string
          weather_condition?: string | null
        }
        Update: {
          actual_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          day_of_week?: number
          distance_km?: number | null
          estimated_minutes?: number
          hour_of_day?: number
          id?: string
          order_id?: string
          restaurant_id?: string
          weather_condition?: string | null
        }
        Relationships: []
      }
      delivery_tracking: {
        Row: {
          actual_delivery_time: string | null
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          estimated_delivery_time: string | null
          id: string
          order_id: string
          rider_id: string
          status: Database["public"]["Enums"]["delivery_status"]
          updated_at: string
        }
        Insert: {
          actual_delivery_time?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          estimated_delivery_time?: string | null
          id?: string
          order_id: string
          rider_id: string
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Update: {
          actual_delivery_time?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          estimated_delivery_time?: string | null
          id?: string
          order_id?: string
          rider_id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_restaurants: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_restaurants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      group_order_participants: {
        Row: {
          group_order_id: string
          id: string
          joined_at: string | null
          order_id: string | null
          user_id: string
        }
        Insert: {
          group_order_id: string
          id?: string
          joined_at?: string | null
          order_id?: string | null
          user_id: string
        }
        Update: {
          group_order_id?: string
          id?: string
          joined_at?: string | null
          order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_order_participants_group_order_id_fkey"
            columns: ["group_order_id"]
            isOneToOne: false
            referencedRelation: "group_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_order_participants_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      group_orders: {
        Row: {
          created_at: string | null
          delivery_address: string
          expires_at: string | null
          host_user_id: string
          id: string
          restaurant_id: string
          scheduled_for: string | null
          session_code: string
          status: string
        }
        Insert: {
          created_at?: string | null
          delivery_address: string
          expires_at?: string | null
          host_user_id: string
          id?: string
          restaurant_id: string
          scheduled_for?: string | null
          session_code: string
          status?: string
        }
        Update: {
          created_at?: string | null
          delivery_address?: string
          expires_at?: string | null
          host_user_id?: string
          id?: string
          restaurant_id?: string
          scheduled_for?: string | null
          session_code?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          current_position: string | null
          email: string
          full_name: string
          id: string
          job_id: string
          linkedin_url: string | null
          notes: string | null
          phone: string
          portfolio_url: string | null
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          current_position?: string | null
          email: string
          full_name: string
          id?: string
          job_id: string
          linkedin_url?: string | null
          notes?: string | null
          phone: string
          portfolio_url?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          current_position?: string | null
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string
          portfolio_url?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          created_at: string | null
          department: string
          description: string
          employment_type: string
          id: string
          is_active: boolean | null
          location: string
          posted_by: string | null
          requirements: string
          responsibilities: string
          salary_range: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          description: string
          employment_type?: string
          id?: string
          is_active?: boolean | null
          location: string
          posted_by?: string | null
          requirements: string
          responsibilities: string
          salary_range?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          description?: string
          employment_type?: string
          id?: string
          is_active?: boolean | null
          location?: string
          posted_by?: string | null
          requirements?: string
          responsibilities?: string
          salary_range?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_redemptions: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          order_id: string | null
          points_spent: number
          reward_id: string
          used: boolean | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_spent: number
          reward_id: string
          used?: boolean | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points_spent?: number
          reward_id?: string
          used?: boolean | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_order_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_order_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_order_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          order_id: string
          price: number
          quantity: number
          special_instructions: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          order_id: string
          price: number
          quantity: number
          special_instructions?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          order_id?: string
          price?: number
          quantity?: number
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          commission_amount: number | null
          created_at: string
          customer_id: string
          delivery_address: string
          delivery_fee: number
          delivery_latitude: number | null
          delivery_longitude: number | null
          discount_amount: number | null
          estimated_delivery_time: number | null
          id: string
          notes: string | null
          order_notes: string | null
          payment_method: string | null
          payment_status: string | null
          promo_code: string | null
          restaurant_id: string
          rider_id: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          commission_amount?: number | null
          created_at?: string
          customer_id: string
          delivery_address: string
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          discount_amount?: number | null
          estimated_delivery_time?: number | null
          id?: string
          notes?: string | null
          order_notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          promo_code?: string | null
          restaurant_id: string
          rider_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          commission_amount?: number | null
          created_at?: string
          customer_id?: string
          delivery_address?: string
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          discount_amount?: number | null
          estimated_delivery_time?: number | null
          id?: string
          notes?: string | null
          order_notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          promo_code?: string | null
          restaurant_id?: string
          rider_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          bank_details: Json | null
          created_at: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          rider_id: string
          status: string
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          rider_id: string
          status?: string
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          rider_id?: string
          status?: string
        }
        Relationships: []
      }
      prime_memberships: {
        Row: {
          cancelled_at: string | null
          created_at: string
          expires_at: string
          id: string
          payment_method: string | null
          price: number
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          payment_method?: string | null
          price?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          payment_method?: string | null
          price?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_prime_member: boolean | null
          loyalty_points: number | null
          phone: string | null
          prime_expires_at: string | null
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          updated_at: string
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_prime_member?: boolean | null
          loyalty_points?: number | null
          phone?: string | null
          prime_expires_at?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          updated_at?: string
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_prime_member?: boolean | null
          loyalty_points?: number | null
          phone?: string | null
          prime_expires_at?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          updated_at?: string
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          code: string
          created_at: string | null
          description: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          restaurant_id: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          restaurant_id?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          restaurant_id?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          discount_used: boolean | null
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          discount_used?: boolean | null
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          discount_used?: boolean | null
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_applications: {
        Row: {
          address: string
          business_license: string | null
          created_at: string
          cuisine_type: string | null
          description: string | null
          id: string
          merchant_id: string
          phone: string
          rejection_reason: string | null
          restaurant_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          business_license?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          id?: string
          merchant_id: string
          phone: string
          rejection_reason?: string | null
          restaurant_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          business_license?: string | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          id?: string
          merchant_id?: string
          phone?: string
          rejection_reason?: string | null
          restaurant_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          average_rating: number | null
          commission_rate: number | null
          created_at: string
          cuisine_type: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          merchant_id: string
          name: string
          phone: string
          review_count: number | null
          updated_at: string
        }
        Insert: {
          address: string
          average_rating?: number | null
          commission_rate?: number | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          merchant_id: string
          name: string
          phone: string
          review_count?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          average_rating?: number | null
          commission_rate?: number | null
          created_at?: string
          cuisine_type?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          merchant_id?: string
          name?: string
          phone?: string
          review_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string
          restaurant_id: string
          restaurant_rating: number | null
          rider_id: string | null
          rider_rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          restaurant_id: string
          restaurant_rating?: number | null
          rider_id?: string | null
          rider_rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          restaurant_id?: string
          restaurant_rating?: number | null
          rider_id?: string | null
          rider_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points_cost: number
          reward_type: string
          reward_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_cost: number
          reward_type: string
          reward_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_cost?: number
          reward_type?: string
          reward_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      rider_badges: {
        Row: {
          badge_type: string
          earned_at: string | null
          id: string
          level: number | null
          rider_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string | null
          id?: string
          level?: number | null
          rider_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string | null
          id?: string
          level?: number | null
          rider_id?: string
        }
        Relationships: []
      }
      rider_earnings: {
        Row: {
          base_fee: number
          created_at: string | null
          distance_bonus: number | null
          id: string
          order_id: string
          paid_out: boolean | null
          rider_id: string
          tip_amount: number | null
          total_earned: number
        }
        Insert: {
          base_fee: number
          created_at?: string | null
          distance_bonus?: number | null
          id?: string
          order_id: string
          paid_out?: boolean | null
          rider_id: string
          tip_amount?: number | null
          total_earned: number
        }
        Update: {
          base_fee?: number
          created_at?: string | null
          distance_bonus?: number | null
          id?: string
          order_id?: string
          paid_out?: boolean | null
          rider_id?: string
          tip_amount?: number | null
          total_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "rider_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_emergency_contacts: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone: string
          relationship: string | null
          rider_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          phone: string
          relationship?: string | null
          rider_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone?: string
          relationship?: string | null
          rider_id?: string
        }
        Relationships: []
      }
      rider_profiles: {
        Row: {
          city: string
          created_at: string
          id: string
          is_available: boolean | null
          license_number: string
          phone: string
          rating: number | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rider_id: string
          status: string
          total_deliveries: number | null
          updated_at: string
          vehicle_plate_number: string
          vehicle_type: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_available?: boolean | null
          license_number: string
          phone: string
          rating?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rider_id: string
          status?: string
          total_deliveries?: number | null
          updated_at?: string
          vehicle_plate_number: string
          vehicle_type: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_available?: boolean | null
          license_number?: string
          phone?: string
          rating?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rider_id?: string
          status?: string
          total_deliveries?: number | null
          updated_at?: string
          vehicle_plate_number?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      support_responses: {
        Row: {
          created_at: string | null
          id: string
          is_staff: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_staff?: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_staff?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string | null
          id: string
          message: string
          order_id: string | null
          priority: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          order_id?: string | null
          priority?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          order_id?: string | null
          priority?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_referral_code: {
        Args: { ref_code: string; user_id: string }
        Returns: boolean
      }
      approve_restaurant_application: {
        Args: { admin_id: string; application_id: string }
        Returns: string
      }
      approve_rider_application: {
        Args: { admin_id: string; rider_profile_id: string }
        Returns: undefined
      }
      assign_merchant_role: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      assign_rider_role: { Args: { user_id_param: string }; Returns: undefined }
      create_notification: {
        Args: {
          p_message: string
          p_order_id?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_reward: {
        Args: { p_reward_id: string; p_user_id: string }
        Returns: string
      }
      reject_restaurant_application: {
        Args: { admin_id: string; application_id: string; reason: string }
        Returns: undefined
      }
      reject_rider_application: {
        Args: { admin_id: string; reason: string; rider_profile_id: string }
        Returns: undefined
      }
      update_application_status: {
        Args: { p_application_id: string; p_notes?: string; p_status: string }
        Returns: undefined
      }
    }
    Enums: {
      delivery_status:
        | "pending"
        | "assigned"
        | "picked_up"
        | "in_transit"
        | "delivered"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready_for_pickup"
        | "picked_up"
        | "delivering"
        | "delivered"
        | "cancelled"
        | "picking_it_up"
      payment_method_type: "cash" | "card" | "cih_pay" | "wallet"
      user_role: "customer" | "merchant" | "rider" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      delivery_status: [
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
      ],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "picked_up",
        "delivering",
        "delivered",
        "cancelled",
        "picking_it_up",
      ],
      payment_method_type: ["cash", "card", "cih_pay", "wallet"],
      user_role: ["customer", "merchant", "rider", "admin"],
    },
  },
} as const
