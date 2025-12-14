import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import WaitlistDialog from "@/components/WaitlistDialog";

const Header = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/1c0deaff-28dc-470f-a8c4-7b2b56ebce0d.png" 
              alt="Posible Logo" 
              className="h-10 w-auto hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#vision" className="text-muted-foreground hover:text-foreground transition-colors">
              Vision
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Button variant="outline" className="hidden md:inline-flex">
                Admin Console
              </Button>
            </Link>
            <Button variant="hero" onClick={() => setWaitlistOpen(true)}>
              Join Waitlist
            </Button>
          </div>
        </div>
      </nav>
      
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </header>
  );
};

export default Header;