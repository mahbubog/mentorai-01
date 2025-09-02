import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Briefcase,
  Download,
  FileText,
  FileUp,
  History,
  MessageSquarePlus,
  Users,
} from "lucide-react";

const features = [
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: "Academic Q&A",
    description:
      "Get detailed explanations and step-by-step solutions for your academic questions.",
  },
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: "Career Guidance",
    description:
      "Receive professional insights and guidance for your career path and job search.",
  },
  {
    icon: <FileUp className="h-8 w-8 text-primary" />,
    title: "Multi-format Upload",
    description:
      "Support for PDF, Image, DOC, and Excel files to get context-aware answers.",
  },
  {
    icon: <MessageSquarePlus className="h-8 w-8 text-primary" />,
    title: "Personalized Follow-up",
    description:
      "Contextual answers and personalized follow-up questions to deepen your understanding.",
  },
  {
    icon: <Download className="h-8 w-8 text-primary" />,
    title: "Save & Export",
    description:
      "Save your important conversations and export them as PDF or Text files.",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "Resume/CV Optimization",
    description:
      "Optimize your resume and CV with AI-powered suggestions to stand out.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Interview Preparation",
    description:
      "Practice for interviews with AI-driven tips and mock interview sessions.",
  },
  {
    icon: <History className="h-8 w-8 text-primary" />,
    title: "History & File Management",
    description:
      "Easily access your chat history and manage all your uploaded files in one place.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
            Powerful Features to Guide You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            Everything you need for academic success and career readiness, all
            in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="text-left">
              <CardHeader>{feature.icon}</CardHeader>
              <CardContent>
                <CardTitle className="mb-2 text-lg">{feature.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};