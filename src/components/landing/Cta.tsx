import { Button } from "@/components/ui/button";

export const Cta = () => {
  return (
    <section className="py-20 md:py-32 bg-muted/50">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
          Start Your Journey Today
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4 mb-8">
          Learn smarter. Prepare better. Get career-ready.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">Start for Free</Button>
          <Button size="lg" variant="outline" className="bg-background">
            Explore Features
          </Button>
        </div>
      </div>
    </section>
  );
};