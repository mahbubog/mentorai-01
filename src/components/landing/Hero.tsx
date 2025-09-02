import { Button } from "@/components/ui/button";
import { ChatPreview } from "./ChatPreview";
import { PlayCircle, MessageSquare } from "lucide-react"; // Changed Rocket to MessageSquare

export const Hero = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container text-center">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl mb-4"> {/* Changed font-bold to font-extrabold */}
          Your AI Academic & <span className="text-primary">Career</span> Mentor
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Ask any academic or job-related question and get accurate, detailed
          answers instantly. Your personalized AI assistant for learning and
          career growth.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">
            <MessageSquare className="mr-2 h-5 w-5" /> {/* Changed icon to MessageSquare */}
            Start Chatting
          </Button>
          <Button size="lg" variant="outline">
            <PlayCircle className="mr-2 h-5 w-5" />
            Learn More
          </Button>
        </div>
        <ChatPreview />
      </div>
    </section>
  );
};