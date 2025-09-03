import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, MessageCircle, Upload, Settings, FileText, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I start a new conversation?",
      answer: "Click the 'New Chat' button in the sidebar or select a different assistant type (Academic/Career) to start fresh."
    },
    {
      question: "What file formats can I upload?",
      answer: "You can upload PDF, DOC, DOCX, Excel (XLS, XLSX), and image files (PNG, JPG, JPEG). Maximum file size is 10MB."
    },
    {
      question: "How does the Academic Assistant work?",
      answer: "The Academic Assistant helps with homework, research, explanations, and educational content. It provides detailed, step-by-step solutions with references."
    },
    {
      question: "What can the Career Assistant do?",
      answer: "The Career Assistant helps with resume review, job search advice, interview preparation, salary negotiation, and professional development."
    },
    {
      question: "Can I save my conversations?",
      answer: "Yes! All your conversations are automatically saved and can be accessed from the sidebar. You can also export responses as PDF or text files."
    },
    {
      question: "Is there a guest mode?",
      answer: "Yes, you can use the chatbot as a guest with limited features. For full functionality including file uploads and conversation history, please create an account."
    },
    {
      question: "How do I change my preferences?",
      answer: "Go to Settings from the sidebar to customize your AI response tone, language, and notification preferences."
    },
    {
      question: "What should I do if I get an error?",
      answer: "Try refreshing the page first. If the problem persists, check your internet connection or contact support."
    }
  ];

  const tutorials = [
    {
      title: "Getting Started",
      description: "Learn the basics of using the AI chatbot",
      icon: MessageCircle,
      steps: [
        "Create an account or use guest mode",
        "Choose Academic or Career assistant",
        "Type your question or upload a file",
        "Review the AI response",
        "Ask follow-up questions or start a new chat"
      ]
    },
    {
      title: "File Uploads",
      description: "How to upload and use files in conversations",
      icon: Upload,
      steps: [
        "Click the paperclip icon in the input area",
        "Select your file (PDF, DOC, Excel, or image)",
        "Wait for the file to upload",
        "Ask questions about the uploaded content",
        "The AI will reference your file in responses"
      ]
    },
    {
      title: "Managing Settings",
      description: "Customize your experience",
      icon: Settings,
      steps: [
        "Click Settings in the sidebar",
        "Update your profile information",
        "Choose your preferred response tone",
        "Select your language preference",
        "Save your changes"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <p className="text-muted-foreground">Find answers and learn how to use the AI chatbot</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Start Tutorials */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Quick Start Tutorials</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {tutorials.map((tutorial, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <tutorial.icon className="h-5 w-5" />
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2 text-sm">
                      {tutorial.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-2">
                          <span className="font-medium text-primary">{stepIndex + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <Card>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="px-6">
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* Supported Files */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Supported File Types</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• PDF files (.pdf)</li>
                      <li>• Word documents (.doc, .docx)</li>
                      <li>• Text files (.txt)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Spreadsheets & Images</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Excel files (.xls, .xlsx)</li>
                      <li>• Images (.png, .jpg, .jpeg)</li>
                      <li>• Maximum size: 10MB per file</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Support */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Contact Support</h3>
                    <p className="text-muted-foreground mb-4">
                      Can't find what you're looking for? Our support team is here to help.
                    </p>
                  </div>
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Help;