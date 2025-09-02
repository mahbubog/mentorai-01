import { Bot, CheckCircle2 } from "lucide-react";

const AuthBrandingPanel = () => {
  const features = [
    "24/7 Academic Support",
    "Career Guidance & Planning",
    "Personalized Learning Path",
  ];

  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-primary text-primary-foreground p-12">
      <div className="max-w-sm text-center">
        <Bot className="h-20 w-20 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">AI Academic Assistant</h1>
        <p className="text-lg opacity-90 mb-8">
          Get personalized guidance for your academic and professional journey
          with our intelligent chatbot.
        </p>
        <ul className="space-y-4 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-lg">
              <CheckCircle2 className="h-6 w-6 mr-3 text-green-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AuthBrandingPanel;