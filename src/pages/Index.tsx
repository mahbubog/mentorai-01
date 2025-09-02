// Update this page (the content is just a fallback if you fail to update the page)

import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom"; // Import Link

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600 mb-8">
          Start building your amazing project here!
        </p>
        <Link to="/chat" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors text-lg font-medium">
          Go to Chat
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;