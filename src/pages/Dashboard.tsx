import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { SwapRequestModal } from "@/components/SwapRequestModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, Star, MessageSquare, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  availability?: string;
  is_public: boolean;
}

interface Skill {
  id: string;
  user_id: string;
  skill_name: string;
  skill_type: string;
  created_at: string;
}

interface ProfileWithSkills extends Profile {
  skills: Skill[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileWithSkills[]>([]);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithSkills | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    fetchPublicProfiles();
    if (user) {
      fetchUserSkills();
    }
  }, [user]);

  const fetchPublicProfiles = async () => {
    try {
      // Fetch public profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_public", true);

      if (profilesError) throw profilesError;

      if (profilesData) {
        // Fetch skills for each profile
        const profilesWithSkills = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: skills, error: skillsError } = await supabase
              .from("skills")
              .select("*")
              .eq("user_id", profile.user_id);

            if (skillsError) {
              console.error("Error fetching skills:", skillsError);
              return { ...profile, skills: [] };
            }

            return { ...profile, skills: skills || [] };
          })
        );

        setProfiles(profilesWithSkills);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSkills = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserSkills(data || []);
    } catch (error) {
      console.error("Error fetching user skills:", error);
    }
  };

  const createSwapRequest = async (providerId: string, skillOffered: string, skillWanted: string, message?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("skill_swaps")
        .insert({
          requester_id: user.id,
          provider_id: providerId,
          skill_offered: skillOffered,
          skill_wanted: skillWanted,
          message: message || null,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Swap request sent!",
        description: "Your skill swap request has been sent successfully.",
      });
    } catch (error) {
      console.error("Error creating swap request:", error);
      toast({
        title: "Error",
        description: "Failed to send swap request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = 
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.skills.some(skill => 
        skill.skill_name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (profile.location && profile.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkill = !skillFilter || skillFilter === "all" || 
      profile.skills.some(skill => skill.skill_type === skillFilter);

    const matchesAvailability = !availabilityFilter || availabilityFilter === "any" || 
      (profile.availability && profile.availability.includes(availabilityFilter));

    return matchesSearch && matchesSkill && matchesAvailability;
  });

  const skillTypes = [...new Set(profiles.flatMap(p => p.skills.map(s => s.skill_type)))];
  const availabilityOptions = [...new Set(profiles.map(p => p.availability).filter(Boolean))];

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Discover Skills</h1>
          <p className="text-muted-foreground">
            Find people with skills you want to learn, and share what you know
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search skills, names, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by skill type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All skill types</SelectItem>
                  {skillTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any availability</SelectItem>
                  {availabilityOptions.map((availability) => (
                    <SelectItem key={availability} value={availability}>
                      {availability}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSkillFilter("");
                  setAvailabilityFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-warning" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                  <p className="text-2xl font-bold text-foreground">
                    {profiles.reduce((total, profile) => total + profile.skills.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-success" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Skill Categories</p>
                  <p className="text-2xl font-bold text-foreground">{skillTypes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard 
              key={profile.id} 
              profile={profile} 
              onRequestSwap={(profile) => {
                setSelectedProfile(profile);
                setShowSwapModal(true);
              }}
              currentUserId={user?.id}
            />
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No profiles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters or check back later for new members.
            </p>
          </div>
        )}

        {/* Swap Request Modal */}
        {selectedProfile && (
          <SwapRequestModal
            isOpen={showSwapModal}
            onClose={() => {
              setShowSwapModal(false);
              setSelectedProfile(null);
            }}
            targetProfile={selectedProfile}
            userSkills={userSkills}
            onSubmit={createSwapRequest}
          />
        )}
      </div>
    </div>
  );
}

interface ProfileCardProps {
  profile: ProfileWithSkills;
  onRequestSwap: (profile: ProfileWithSkills) => void;
  currentUserId?: string;
}

function ProfileCard({ profile, onRequestSwap, currentUserId }: ProfileCardProps) {

  // Don't show current user's profile
  if (profile.user_id === currentUserId) {
    return null;
  }

  const offeredSkills = profile.skills.filter(skill => skill.skill_type === "offered");
  const wantedSkills = profile.skills.filter(skill => skill.skill_type === "wanted");

  return (
    <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
            {profile.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {profile.location}
              </div>
            )}
            {profile.availability && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {profile.availability}
              </div>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="text-sm text-muted-foreground mt-3">{profile.bio}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="offers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offers">Offers ({offeredSkills.length})</TabsTrigger>
            <TabsTrigger value="wants">Wants ({wantedSkills.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="offers" className="mt-4">
            <div className="flex flex-wrap gap-2">
              {offeredSkills.map((skill) => (
                <Badge key={skill.id} variant="default">
                  {skill.skill_name}
                </Badge>
              ))}
              {offeredSkills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills offered yet</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="wants" className="mt-4">
            <div className="flex flex-wrap gap-2">
              {wantedSkills.map((skill) => (
                <Badge key={skill.id} variant="outline">
                  {skill.skill_name}
                </Badge>
              ))}
              {wantedSkills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills wanted yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onRequestSwap(profile)}
            disabled={offeredSkills.length === 0}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Request Swap
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}