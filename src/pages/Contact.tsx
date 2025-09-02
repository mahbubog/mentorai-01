import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const ContactPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground mt-4">
            This page is under construction.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;