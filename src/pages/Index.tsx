import { useState, useEffect } from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { Cta } from "@/components/landing/Cta";
import { ChatPreview } from "@/components/landing/ChatPreview";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, BookOpen, Briefcase } from "lucide-react";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  const handleStartChat = () => {
    if (user) {
      navigate("/chat");
    } else {
      navigate("/guest-chat");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      {/* Enhanced Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your AI Study & Career Assistant
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get instant help with homework, career advice, file analysis, and more. 
              Choose between Academic and Career assistants tailored to your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={handleStartChat} className="text-lg px-8">
                <MessageSquare className="mr-2 h-5 w-5" />
                Start Chatting Now
              </Button>
              {!user && (
                <Link to="/signup">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Create Free Account
                  </Button>
                </Link>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                <div className="text-muted-foreground">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                <div className="text-muted-foreground">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Always Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistants Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Choose Your AI Assistant</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Specialized AI assistants designed for different needs - academic help or career guidance
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                  Academic Assistant
                </CardTitle>
                <CardDescription className="text-lg">
                  Your study companion for homework, research, and learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Step-by-step homework solutions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Research assistance with references</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Concept explanations and examples</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Document and image analysis</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    if (user) {
                      navigate("/chat");
                    } else {
                      navigate("/guest-chat");
                    }
                  }}
                >
                  Try Academic Assistant
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Briefcase className="h-8 w-8 text-green-500" />
                  Career Assistant
                </CardTitle>
                <CardDescription className="text-lg">
                  Professional guidance for your career journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Resume review and optimization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Interview preparation and tips</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Job search strategies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Professional development advice</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                  onClick={() => {
                    if (user) {
                      navigate("/chat");
                    } else {
                      navigate("/guest-chat");
                    }
                  }}
                >
                  Try Career Assistant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Features />
      <ChatPreview />
      <Testimonials />
      <Cta />
      <Footer />
    </div>
  );
};

export default Index;