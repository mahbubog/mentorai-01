import { BrainCircuit, Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-start gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-white"
          >
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="text-lg">AI Mentor</span>
          </Link>
          <p className="text-sm">
            Your intelligent companion for academic success and career growth.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <nav className="flex flex-col gap-2">
            <Link to="/features" className="text-sm hover:text-white">
              Features
            </Link>
            <Link to="#" className="text-sm hover:text-white">
              Pricing
            </Link>
            <Link to="#" className="text-sm hover:text-white">
              API
            </Link>
          </nav>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Company</h4>
          <nav className="flex flex-col gap-2">
            <Link to="/about" className="text-sm hover:text-white">
              About
            </Link>
            <Link to="/privacy" className="text-sm hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm hover:text-white">
              Terms of Service
            </Link>
          </nav>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">Connect</h4>
          <div className="flex gap-4 mb-4">
            <Link to="#" className="hover:text-white">
              <Github className="h-5 w-5" />
            </Link>
            <Link to="#" className="hover:text-white">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link to="#" className="hover:text-white">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
          <a
            href="mailto:support@aimentor.com"
            className="text-sm hover:text-white"
          >
            support@aimentor.com
          </a>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4">
        <div className="container text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AI Mentor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};