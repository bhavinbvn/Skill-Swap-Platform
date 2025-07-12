await supabase.from("swap_requests").update({ status: "accepted" }).eq("id", swapId);
