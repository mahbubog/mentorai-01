"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Bot, Briefcase } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Bot className="h-5 w-5 text-primary" />,
      text: "Get instant help from our AI Academic Assistant.",
    },
    {
      icon: <Briefcase className="h-5 w-5 text-primary" />,
      text: "Receive personalized career and job-seeking advice.",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      text: "Upload documents, get summaries, and ask questions.",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome Aboard!</CardTitle>
          <CardDescription className="text-lg">
            You're all set up. Here's a quick look at what you can do.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-left space-y-4 p-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                {feature.icon}
                <p className="text-muted-foreground">{feature.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <p className="font-semibold">Quick Tutorial: Ask your first question!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Once you enter the main chat, just type your question in the input box at the bottom and press Enter. It's that simple!
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate("/chat")}>
            Let's Get Started
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Welcome;