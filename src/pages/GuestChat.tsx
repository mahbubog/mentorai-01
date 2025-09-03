import { useState } from "react";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationType } from "@/components/chat/ConversationType";
import { Message } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { UserPlus, MessageSquare, Upload, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GuestChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationType, setConversationType] = useState<'academic' | 'career'>('academic');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (messageContent: string) => {
    if (isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate AI response for guest mode
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getGuestResponse(conversationType),
      };

      setMessages(prev => [...prev, aiResponse]);

      // Show upgrade prompt after a few messages
      if (messages.length >= 4) {
        toast({
          title: "Upgrade to full version",
          description: "Sign up to access advanced features, file uploads, and conversation history.",
          action: (
            <Link to="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          ),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGuestResponse = (type: 'academic' | 'career'): string => {
    const academicResponses = [
      "I'd be happy to help with your academic question! In the full version, I can provide detailed explanations, step-by-step solutions, and even analyze uploaded documents.",
      "This is a great academic question! With a full account, you'll get comprehensive answers with references, examples, and the ability to upload files for analysis.",
      "For academic assistance like this, the full version offers advanced features like document analysis, detailed explanations, and conversation history."
    ];

    const careerResponses = [
      "I can help with career advice! In the full version, I can review your resume, analyze job descriptions, and provide personalized career guidance.",
      "That's an excellent career question! With a full account, you'll get detailed professional advice, resume analysis, and interview preparation tips.",
      "For career guidance like this, the full version offers features like resume review, job market insights, and personalized development plans."
    ];

    const responses = type === 'academic' ? academicResponses : careerResponses;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Guest Mode Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Guest Mode</h1>
              <ConversationType 
                type={conversationType}
                onTypeChange={setConversationType}
              />
            </div>
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Guest Sidebar */}
        <div className="w-80 border-r bg-muted/40 p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Guest Mode
              </CardTitle>
              <CardDescription className="text-sm">
                Try our AI assistant with limited features
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Upgrade for Full Features</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>File uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>Conversation history</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Advanced AI responses</span>
                </div>
              </div>
              <Link to="/signup">
                <Button className="w-full mt-4" size="sm">
                  Create Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Current Limitations</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Basic responses only</li>
                <li>• No file uploads</li>
                <li>• No conversation saving</li>
                <li>• Limited daily messages</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to Guest Mode
                </h2>
                <p className="text-muted-foreground mb-6">
                  Try our {conversationType} assistant with basic features. 
                  Sign up for full functionality including file uploads and conversation history.
                </p>
                <div className="flex gap-2 justify-center">
                  <Link to="/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button>Create Account</Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden p-4">
              <ChatMessages messages={messages} />
            </div>
          )}

          <div className="border-t bg-card p-4">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Guest mode • {messages.length}/10 messages used • 
              <Link to="/signup" className="text-primary hover:underline ml-1">
                Sign up for unlimited access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestChat;