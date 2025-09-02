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
    name: "Sarah L.",
    avatar: "SL",
    title: "Student",
    quote:
      "This chatbot helped me crack my job interview! The AI-driven practice sessions were a game-changer.",
    rating: 5,
  },
  {
    name: "Michael B.",
    avatar: "MB",
    title: "Job Seeker",
    quote:
      "I finally understood complex calculus concepts thanks to the step-by-step explanations. Highly recommended for students.",
    rating: 5,
  },
  {
    name: "Jessica P.",
    avatar: "JP",
    title: "Student",
    quote:
      "The resume optimization feature is incredible. I got more callbacks within a week of using it.",
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
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
            Loved by Students and Job Seekers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            See what others are saying about their journey with our AI Mentor.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col items-start gap-4 p-6 text-left">
                      <div className="flex items-center gap-4">
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
                      <blockquote className="text-sm text-muted-foreground italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex gap-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};