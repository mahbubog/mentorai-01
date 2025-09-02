import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container text-center">
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl mb-4">
          Your AI Academic & Career Mentor
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Ask any academic or job-related question and get accurate, detailed
          answers instantly.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">Start Chatting</Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};