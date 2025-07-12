import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface Skill {
  id: string;
  skill_name: string;
  skill_type: string;
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  skills: Skill[];
}

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: Profile;
  userSkills: Skill[];
  onSubmit: (providerId: string, skillOffered: string, skillWanted: string, message?: string) => Promise<void>;
}

export function SwapRequestModal({ 
  isOpen, 
  onClose, 
  targetProfile, 
  userSkills, 
  onSubmit 
}: SwapRequestModalProps) {
  const [skillOffered, setSkillOffered] = useState("");
  const [skillWanted, setSkillWanted] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userOfferedSkills = userSkills.filter(skill => skill.skill_type === "offered");
  const targetOfferedSkills = targetProfile.skills.filter(skill => skill.skill_type === "offered");

  const handleSubmit = async () => {
    if (!skillOffered || !skillWanted) return;

    setIsSubmitting(true);
    try {
      await onSubmit(targetProfile.user_id, skillOffered, skillWanted, message);
      // Reset form
      setSkillOffered("");
      setSkillWanted("");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error submitting swap request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5" />
            Request Skill Swap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target Profile Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {targetProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{targetProfile.name}</p>
              <p className="text-sm text-muted-foreground">
                {targetOfferedSkills.length} skills offered
              </p>
            </div>
          </div>

          {/* Skill Selection */}
          <div className="space-y-4">
            <div>
              <Label>I can offer:</Label>
              <Select value={skillOffered} onValueChange={setSkillOffered}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill you can teach" />
                </SelectTrigger>
                <SelectContent>
                  {userOfferedSkills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.skill_name}>
                      {skill.skill_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userOfferedSkills.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  You need to add some skills you can offer in your profile first.
                </p>
              )}
            </div>

            <div>
              <Label>I want to learn:</Label>
              <Select value={skillWanted} onValueChange={setSkillWanted}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill you want to learn" />
                </SelectTrigger>
                <SelectContent>
                  {targetOfferedSkills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.skill_name}>
                      {skill.skill_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Skills Preview */}
          {(skillOffered || skillWanted) && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Swap Summary:</p>
              <div className="flex flex-wrap gap-2">
                {skillOffered && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">You offer:</span>
                    <Badge variant="default">{skillOffered}</Badge>
                  </div>
                )}
                {skillWanted && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">You want:</span>
                    <Badge variant="outline">{skillWanted}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Message */}
          <div>
            <Label>Message (optional):</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to introduce yourself..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!skillOffered || !skillWanted || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}