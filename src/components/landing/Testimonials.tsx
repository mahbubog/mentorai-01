import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    avatar: "SJ",
    title: "Computer Science Student",
    quote:
      "This chatbot helped me crack my job interview! The mock interviews were incredibly realistic and the feedback was spot-on.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    avatar: "MC",
    title: "Engineering Student",
    quote:
      "Amazing for academic help! I can upload my lecture notes and get detailed explanations. It's like having a personal tutor 24/7.",
    rating: 5,
  },
  {
    name: "Emma Williams",
    avatar: "EW",
    title: "Business Student",
    quote:
      "The career guidance feature is phenomenal. It helped me identify my strengths and choose the right career path.",
    rating: 5,
  },
  {
    name: "David C.",
    avatar: "DC",
    title: "Recent Graduate",
    quote:
      "A must-have tool for any student or job seeker. It's like having a personal mentor available 24/7.",
    rating: 5,
  },
];

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />,
    );
  }
  return stars;
};

export const Testimonials = () => {
  return (
    <section className="py-20 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            What Students Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            Join thousands of students who've transformed their learning
            experience.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2">
                  <Card className="h-full bg-white">
                    <CardContent className="flex h-full flex-col items-start justify-between gap-4 p-6 text-left">
                      <div>
                        <div className="flex gap-1 mb-4">
                          {renderStars(testimonial.rating)}
                        </div>
                        <blockquote className="text-base text-foreground">
                          "{testimonial.quote}"
                        </blockquote>
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`}
                          />
                          <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.title}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-[-40px]" />
          <CarouselNext className="mr-[-40px]" />
        </Carousel>
      </div>
    </section>
  );
};