import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { 
  Users, 
  ArrowRight, 
  Star, 
  MessageSquare, 
  Search,
  Shield,
  Globe,
  Zap
} from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Users className="h-16 w-16" />
              <h1 className="text-5xl font-bold">SkillSwap</h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Exchange Skills, Build Communities
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
              Connect with people who want to learn what you know, and learn what they know.
              Share knowledge, grow together, and build meaningful connections in our vibrant community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="default" asChild className="bg-white text-primary hover:bg-white/90">
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">How SkillSwap Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy to find skill partners, exchange knowledge, and grow together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-elegant transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Discover Skills</h3>
                <p className="text-muted-foreground">
                  Browse profiles and find people with skills you want to learn.
                  Filter by location, availability, and skill type.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-elegant transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="bg-success/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Request Swaps</h3>
                <p className="text-muted-foreground">
                  Send skill swap requests to connect with others.
                  Offer what you know in exchange for what you want to learn.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-elegant transition-all duration-300">
              <CardContent className="pt-8 pb-8">
                <div className="bg-warning/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Share & Learn</h3>
                <p className="text-muted-foreground">
                  Meet up, exchange knowledge, and rate your experience.
                  Build a reputation and expand your network.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose SkillSwap?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of learners and teachers in our growing community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Verified profiles and community ratings ensure safe exchanges
              </p>
            </div>

            <div className="text-center">
              <div className="bg-success rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-success-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Global Community</h3>
              <p className="text-muted-foreground">
                Connect with skill partners from around the world
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Matching</h3>
              <p className="text-muted-foreground">
                Smart algorithms help you find the perfect skill partners
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Skill Journey?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join our community today and start exchanging skills with people around the world.
          </p>
          <Button size="xl" variant="secondary" asChild>
            <Link to="/auth">
              Join SkillSwap Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">SkillSwap</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Connecting learners and teachers worldwide
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 SkillSwap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
