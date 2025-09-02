import { Button } from "@/components/ui/button";
import { Rocket, Compass } from "lucide-react";

export const Cta = () => {
  return (
    <section className="py-20 md:py-24 bg-primary text-primary-foreground"> {/* Changed background to solid primary */}
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
          >
            <Rocket className="mr-2 h-5 w-5" />
            Start for Free
          </Button>
          <Button
            size="lg"
            className="border border-primary text-primary bg-transparent hover:bg-primary/10" // Updated styling for outline button
          >
            <Compass className="mr-2 h-5 w-5" />
            Explore Features
          </Button>
        </div>
      </div>
    </section>
  );
};