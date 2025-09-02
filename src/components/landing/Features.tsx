import {
  Briefcase,
  Download,
  FileText,
  FileUp,
  History,
  GraduationCap, // New icon
  UserCog, // New icon
  Handshake, // New icon
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: "Academic Q&A",
    description:
      "Get detailed explanations for complex academic concepts across all subjects.",
    iconBg: "bg-purple-100 text-purple-600", // Matches screenshot
  },
  {
    icon: <Briefcase className="h-6 w-6" />,
    title: "Career Guidance",
    description:
      "Professional insights and advice to help you navigate your career path.",
    iconBg: "bg-purple-100 text-purple-600", // Matches screenshot
  },
  {
    icon: <FileUp className="h-6 w-6" />,
    title: "Multi-format Upload",
    description:
      "Upload PDFs, Images, documents, and Excel files for instant analysis.",
    iconBg: "bg-cyan-100 text-cyan-600", // Matches screenshot
  },
  {
    icon: <UserCog className="h-6 w-6" />, // Changed icon
    title: "Personalized Answers",
    description:
      "Contextual follow-ups and personalized responses based on your needs.",
    iconBg: "bg-green-100 text-green-600", // Matches screenshot
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "Save & Export",
    description:
      "Export your conversations as PDF or text files for future reference.",
    iconBg: "bg-yellow-100 text-yellow-600", // Matches screenshot
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Resume Optimization",
    description:
      "AI-powered CV analysis and optimization for better job prospects.",
    iconBg: "bg-red-100 text-red-600", // Matches screenshot
  },
  {
    icon: <Handshake className="h-6 w-6" />, // Changed icon
    title: "Interview Prep",
    description:
      "Practice interviews with AI feedback and professional tips.",
    iconBg: "bg-blue-100 text-blue-600", // Matches screenshot
  },
  {
    icon: <History className="h-6 w-6" />,
    title: "History & Files",
    description:
      "Organized conversation history and file management system.",
    iconBg: "bg-purple-100 text-purple-600", // Matches screenshot
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
              className="text-left bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl" // Updated styling
            >
              <CardHeader>
                <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center`}>
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