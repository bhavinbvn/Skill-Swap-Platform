import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, MessageSquare, Star, Trash2, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface SkillSwap {
  id: string;
  requester_id: string;
  provider_id: string;
  skill_offered: string;
  skill_wanted: string;
  status: string;
  message?: string;
  feedback?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
}

interface SwapWithProfile extends SkillSwap {
  requester_profile?: Profile;
  provider_profile?: Profile;
}

export default function Swaps() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<SwapWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSwap, setSelectedSwap] = useState<SwapWithProfile | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number>(5);

  useEffect(() => {
    if (user) {
      fetchSwaps();
    }
  }, [user]);

  const fetchSwaps = async () => {
    if (!user) return;

    try {
      const { data: swapsData, error } = await supabase
        .from("skill_swaps")
        .select("*")
        .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (swapsData) {
        // Fetch profiles for each swap
        const swapsWithProfiles = await Promise.all(
          swapsData.map(async (swap) => {
            const [requesterProfile, providerProfile] = await Promise.all([
              supabase
                .from("profiles")
                .select("id, user_id, name, avatar_url")
                .eq("user_id", swap.requester_id)
                .single(),
              supabase
                .from("profiles")
                .select("id, user_id, name, avatar_url")
                .eq("user_id", swap.provider_id)
                .single()
            ]);

            return {
              ...swap,
              requester_profile: requesterProfile.data,
              provider_profile: providerProfile.data,
            };
          })
        );

        setSwaps(swapsWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching swaps:", error);
      toast({
        title: "Error",
        description: "Failed to load swaps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSwapStatus = async (swapId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("skill_swaps")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", swapId);

      if (error) throw error;

      setSwaps(swaps.map(swap => 
        swap.id === swapId ? { ...swap, status } : swap
      ));

      toast({
        title: "Swap updated",
        description: `Swap request ${status}.`,
      });
    } catch (error) {
      console.error("Error updating swap:", error);
      toast({
        title: "Error",
        description: "Failed to update swap. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteSwap = async (swapId: string) => {
    try {
      const { error } = await supabase
        .from("skill_swaps")
        .delete()
        .eq("id", swapId);

      if (error) throw error;

      setSwaps(swaps.filter(swap => swap.id !== swapId));
      
      toast({
        title: "Swap deleted",
        description: "Swap request has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting swap:", error);
      toast({
        title: "Error",
        description: "Failed to delete swap. Please try again.",
        variant: "destructive",
      });
    }
  };

  const submitFeedback = async () => {
    if (!selectedSwap) return;

    try {
      const { error } = await supabase
        .from("skill_swaps")
        .update({
          feedback,
          rating,
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedSwap.id);

      if (error) throw error;

      setSwaps(swaps.map(swap => 
        swap.id === selectedSwap.id 
          ? { ...swap, feedback, rating, status: "completed" } 
          : swap
      ));

      setFeedbackDialog(false);
      setFeedback("");
      setRating(5);
      setSelectedSwap(null);

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const receivedSwaps = swaps.filter(swap => swap.provider_id === user?.id);
  const sentSwaps = swaps.filter(swap => swap.requester_id === user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning text-warning-foreground";
      case "active": return "bg-success text-success-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading swaps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Skill Swaps</h1>
          <p className="text-muted-foreground">
            Manage your skill exchange requests and offers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{swaps.length}</p>
                <p className="text-sm text-muted-foreground">Total Swaps</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {swaps.filter(s => s.status === "pending").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {swaps.filter(s => s.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {swaps.filter(s => s.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Swaps Tabs */}
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              Received Requests ({receivedSwaps.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent Requests ({sentSwaps.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="received" className="mt-6">
            <div className="space-y-4">
              {receivedSwaps.map((swap) => (
                <SwapCard
                  key={swap.id}
                  swap={swap}
                  isReceived={true}
                  currentUserId={user?.id}
                  onUpdateStatus={updateSwapStatus}
                  onDelete={deleteSwap}
                  onProvideFeedback={(swap) => {
                    setSelectedSwap(swap);
                    setFeedbackDialog(true);
                  }}
                />
              ))}
              {receivedSwaps.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No requests received</h3>
                  <p className="text-muted-foreground">
                    When someone requests to swap skills with you, they'll appear here.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sent" className="mt-6">
            <div className="space-y-4">
              {sentSwaps.map((swap) => (
                <SwapCard
                  key={swap.id}
                  swap={swap}
                  isReceived={false}
                  currentUserId={user?.id}
                  onUpdateStatus={updateSwapStatus}
                  onDelete={deleteSwap}
                  onProvideFeedback={(swap) => {
                    setSelectedSwap(swap);
                    setFeedbackDialog(true);
                  }}
                />
              ))}
              {sentSwaps.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No requests sent</h3>
                  <p className="text-muted-foreground">
                    Browse profiles and request skill swaps to get started.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rating</label>
                <Select value={rating.toString()} onValueChange={(value) => setRating(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                    <SelectItem value="2">⭐⭐ Poor</SelectItem>
                    <SelectItem value="1">⭐ Very Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Feedback</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience with this skill swap..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={submitFeedback} className="flex-1">
                  Submit Feedback
                </Button>
                <Button variant="outline" onClick={() => setFeedbackDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

interface SwapCardProps {
  swap: SwapWithProfile;
  isReceived: boolean;
  currentUserId?: string;
  onUpdateStatus: (swapId: string, status: string) => void;
  onDelete: (swapId: string) => void;
  onProvideFeedback: (swap: SwapWithProfile) => void;
}

function SwapCard({ swap, isReceived, currentUserId, onUpdateStatus, onDelete, onProvideFeedback }: SwapCardProps) {
  const otherProfile = isReceived ? swap.requester_profile : swap.provider_profile;
  const canDelete = swap.requester_id === currentUserId && swap.status === "pending";
  const canProvideFeedback = swap.status === "active" && !swap.feedback;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning text-warning-foreground";
      case "active": return "bg-success text-success-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="hover:shadow-card transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {otherProfile?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">{otherProfile?.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(swap.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {isReceived ? "They offer:" : "You offered:"}
                  </span>
                  <Badge variant="default">{swap.skill_offered}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {isReceived ? "For your:" : "For their:"}
                  </span>
                  <Badge variant="outline">{swap.skill_wanted}</Badge>
                </div>
              </div>

              {swap.feedback && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">
                      Rating: {swap.rating}/5
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{swap.feedback}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <Badge className={getStatusColor(swap.status)}>
              {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
            </Badge>
            
            <div className="flex gap-2">
              {isReceived && swap.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => onUpdateStatus(swap.id, "active")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onUpdateStatus(swap.id, "rejected")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {canProvideFeedback && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onProvideFeedback(swap)}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Rate
                </Button>
              )}
              
              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(swap.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}