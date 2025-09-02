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
    icon: <BookOpen className="h-6 w-6" />,
    title: "Academic Q&A",
    description:
      "Get detailed explanations for complex academic concepts across all subjects.",
  },
  {
    icon: <Briefcase className="h-6 w-6" />,
    title: "Career Guidance",
    description:
      "Professional insights and advice to help you navigate your career path.",
  },
  {
    icon: <FileUp className="h-6 w-6" />,
    title: "Multi-format Upload",
    description:
      "Upload PDFs, Images, documents, and Excel files for instant analysis.",
  },
  {
    icon: <MessageSquarePlus className="h-6 w-6" />,
    title: "Personalized Answers",
    description:
      "Contextual follow-ups and personalized responses based on your needs.",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Save & Export",
    description:
      "Export your conversations as PDF or text files for future reference.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Resume Optimization",
    description:
      "AI-powered CV analysis and optimization for better job prospects.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Interview Prep",
    description:
      "Practice interviews with AI feedback and professional tips.",
  },
  {
    icon: <History className="h-6 w-6" />,
    title: "History & Files",
    description:
      "Organized conversation history and file management system.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-24 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            Everything you need to excel in your academic journey and career
            development.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="text-left bg-gray-50/50 hover:shadow-lg transition-shadow rounded-lg"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2 text-lg font-semibold">
                  {feature.title}
                </CardTitle>
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