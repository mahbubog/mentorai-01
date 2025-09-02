import { Button } from "@/components/ui/button";
import { Rocket, Compass } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link

export const Cta = () => {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Start Your Journey Today
        </h2>
        <p className="text-lg max-w-2xl mx-auto mt-4 mb-8">
          Learn smarter. Prepare better. Get career-ready with your AI academic
          and career mentor.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
            asChild // Add asChild to pass props to the Link component
          >
            <Link to="/login"> {/* Wrap button content with Link */}
              <Rocket className="mr-2 h-5 w-5" />
              Start for Free
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
          >
            <Compass className="mr-2 h-5 w-5" />
            Explore Features
          </Button>
        </div>
      </div>
    </section>
  );
};