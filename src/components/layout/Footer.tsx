import { BrainCircuit, Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";

export const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container py-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="text-lg">AI Mentor</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Your AI Academic & Career Mentor
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <nav className="flex gap-4 md:gap-6">
            <Link to="/about" className="text-sm hover:underline">
              About
            </Link>
            <Link to="/privacy" className="text-sm hover:underline">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm hover:underline">
              Terms of Service
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t py-4">
        <div className="container flex justify-between items-center">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Mentor. All rights reserved.
          </p>
          <MadeWithDyad />
        </div>
      </div>
    </footer>
  );
};