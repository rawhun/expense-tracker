import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const uid = user.id;
    const now = new Date();
    const d = (daysAgo: number, hour = 12, min = 0) => {
      const dt = new Date(now);
      dt.setDate(dt.getDate() - daysAgo);
      dt.setHours(hour, min, 0, 0);
      return dt.toISOString();
    };

    await supabase.from('expenses').delete().eq('user_id', uid);
    await supabase.from('goals').delete().eq('user_id', uid);

    const expenses = [
      { user_id: uid, amount: 280, merchant: "Swiggy", category: "Food & Drinks", subcategory: "Food Delivery", notes: "Lunch - Biryani", date: d(0, 13, 15), is_impulse: false, is_recurring: false, confidence: 0.97, payment_method: "UPI" },
      { user_id: uid, amount: 45, merchant: "Chai Point", category: "Food & Drinks", subcategory: "Beverages", notes: "Evening chai", date: d(0, 17, 30), is_impulse: true, is_recurring: false, confidence: 0.95, payment_method: "Cash" },

      { user_id: uid, amount: 1299, merchant: "Amazon", category: "Shopping", subcategory: "Electronics", notes: "Phone case + cable", date: d(1, 11, 0), is_impulse: true, is_recurring: false, confidence: 0.92, payment_method: "Credit Card" },
      { user_id: uid, amount: 186, merchant: "Ola", category: "Transport", subcategory: "Cab", notes: "Office to home", date: d(1, 20, 45), is_impulse: false, is_recurring: false, confidence: 0.99, payment_method: "UPI" },
      { user_id: uid, amount: 349, merchant: "Zomato", category: "Food & Drinks", subcategory: "Food Delivery", notes: "Dinner - Pizza", date: d(1, 21, 0), is_impulse: true, is_recurring: false, confidence: 0.96, payment_method: "UPI" },

      { user_id: uid, amount: 2850, merchant: "BigBasket", category: "Groceries", subcategory: "Monthly Groceries", notes: "Monthly grocery haul", date: d(2, 10, 30), is_impulse: false, is_recurring: false, confidence: 0.98, payment_method: "UPI" },
      { user_id: uid, amount: 149, merchant: "Spotify", category: "Entertainment", subcategory: "Subscription", notes: "Monthly subscription", date: d(2, 9, 0), is_impulse: false, is_recurring: true, confidence: 0.99, payment_method: "Credit Card" },

      { user_id: uid, amount: 450, merchant: "Starbucks", category: "Food & Drinks", subcategory: "Coffee", notes: "Work from cafe", date: d(3, 10, 15), is_impulse: true, is_recurring: false, confidence: 0.97, payment_method: "Credit Card" },
      { user_id: uid, amount: 120, merchant: "BMTC Bus", category: "Transport", subcategory: "Public Transport", notes: "Office commute", date: d(3, 8, 30), is_impulse: false, is_recurring: false, confidence: 0.95, payment_method: "Cash" },

      { user_id: uid, amount: 799, merchant: "Netflix", category: "Entertainment", subcategory: "Subscription", notes: "Monthly plan", date: d(4, 9, 0), is_impulse: false, is_recurring: true, confidence: 0.99, payment_method: "Credit Card" },
      { user_id: uid, amount: 560, merchant: "Pharmacy Plus", category: "Health", subcategory: "Medicine", notes: "Monthly medicines", date: d(4, 12, 0), is_impulse: false, is_recurring: false, confidence: 0.93, payment_method: "UPI" },

      { user_id: uid, amount: 320, merchant: "Swiggy", category: "Food & Drinks", subcategory: "Food Delivery", notes: "Breakfast - Dosa", date: d(5, 9, 15), is_impulse: false, is_recurring: false, confidence: 0.96, payment_method: "UPI" },
      { user_id: uid, amount: 1800, merchant: "Decathlon", category: "Shopping", subcategory: "Sports", notes: "Running shoes", date: d(5, 15, 0), is_impulse: false, is_recurring: false, confidence: 0.94, payment_method: "Credit Card" },

      { user_id: uid, amount: 250, merchant: "Inox Cinema", category: "Entertainment", subcategory: "Movies", notes: "Weekend movie", date: d(7, 19, 0), is_impulse: false, is_recurring: false, confidence: 0.98, payment_method: "UPI" },
      { user_id: uid, amount: 680, merchant: "Zomato", category: "Food & Drinks", subcategory: "Dining Out", notes: "Dinner with friends", date: d(7, 21, 30), is_impulse: false, is_recurring: false, confidence: 0.97, payment_method: "UPI" },
      { user_id: uid, amount: 220, merchant: "Uber", category: "Transport", subcategory: "Cab", notes: "Late night ride", date: d(7, 23, 0), is_impulse: false, is_recurring: false, confidence: 0.99, payment_method: "UPI" },

      { user_id: uid, amount: 3200, merchant: "Myntra", category: "Shopping", subcategory: "Clothing", notes: "New shirts - sale", date: d(10, 14, 0), is_impulse: true, is_recurring: false, confidence: 0.91, payment_method: "Credit Card" },
      { user_id: uid, amount: 180, merchant: "Swiggy", category: "Food & Drinks", subcategory: "Beverages", notes: "Bubble tea", date: d(10, 16, 0), is_impulse: true, is_recurring: false, confidence: 0.95, payment_method: "Cash" },

      { user_id: uid, amount: 499, merchant: "Amazon Prime", category: "Entertainment", subcategory: "Subscription", notes: "Annual plan (monthly equiv)", date: d(12, 9, 0), is_impulse: false, is_recurring: true, confidence: 0.99, payment_method: "Credit Card" },
      { user_id: uid, amount: 1200, merchant: "Cult.fit", category: "Health", subcategory: "Gym", notes: "Monthly gym membership", date: d(12, 8, 0), is_impulse: false, is_recurring: true, confidence: 0.98, payment_method: "UPI" },

      { user_id: uid, amount: 4500, merchant: "Electricity Board", category: "Utilities", subcategory: "Electricity", notes: "Monthly electricity bill", date: d(14, 10, 0), is_impulse: false, is_recurring: true, confidence: 0.99, payment_method: "UPI" },
      { user_id: uid, amount: 799, merchant: "Airtel", category: "Utilities", subcategory: "Mobile Recharge", notes: "Postpaid bill", date: d(14, 11, 0), is_impulse: false, is_recurring: true, confidence: 0.99, payment_method: "UPI" },

      { user_id: uid, amount: 850, merchant: "Barbeque Nation", category: "Food & Drinks", subcategory: "Dining Out", notes: "Team lunch", date: d(18, 13, 0), is_impulse: false, is_recurring: false, confidence: 0.96, payment_method: "Credit Card" },

      { user_id: uid, amount: 2100, merchant: "Flipkart", category: "Shopping", subcategory: "Books", notes: "Tech books bundle", date: d(20, 12, 0), is_impulse: false, is_recurring: false, confidence: 0.94, payment_method: "UPI" },
      { user_id: uid, amount: 400, merchant: "Cafe Coffee Day", category: "Food & Drinks", subcategory: "Coffee", notes: "Client meeting", date: d(20, 11, 0), is_impulse: false, is_recurring: false, confidence: 0.95, payment_method: "Cash" },

      { user_id: uid, amount: 1500, merchant: "Auto Repair", category: "Transport", subcategory: "Vehicle", notes: "Bike servicing", date: d(25, 10, 0), is_impulse: false, is_recurring: false, confidence: 0.9, payment_method: "Cash" },
      { user_id: uid, amount: 250, merchant: "Reliance Fresh", category: "Groceries", subcategory: "Weekly Groceries", notes: "Fruits and veggies", date: d(25, 9, 0), is_impulse: false, is_recurring: false, confidence: 0.97, payment_method: "UPI" },

      { user_id: uid, amount: 5500, merchant: "House Rent", category: "Utilities", subcategory: "Rent", notes: "Monthly room rent", date: d(28, 10, 0), is_impulse: false, is_recurring: true, confidence: 0.99, payment_method: "UPI" },
    ];

    const { error: expErr } = await supabase.from('expenses').insert(expenses);
    if (expErr) throw expErr;

    const goals = [
      { user_id: uid, title: "MacBook Pro M4", target_amount: 180000, current_amount: 42000, status: "active", deadline: new Date(now.getFullYear(), now.getMonth() + 8, 1).toISOString() },
      { user_id: uid, title: "Goa Trip", target_amount: 35000, current_amount: 18500, status: "active", deadline: new Date(now.getFullYear(), 11, 20).toISOString() },
      { user_id: uid, title: "Emergency Fund (6 months)", target_amount: 300000, current_amount: 95000, status: "active", deadline: new Date(now.getFullYear() + 1, 5, 1).toISOString() },
      { user_id: uid, title: "New Bike Upgrade", target_amount: 120000, current_amount: 120000, status: "completed", deadline: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString() },
    ];

    const { error: goalErr } = await supabase.from('goals').insert(goals);
    if (goalErr) throw goalErr;

    return NextResponse.json({ success: true, message: "Sample data seeded successfully!" });
  } catch (error: unknown) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
