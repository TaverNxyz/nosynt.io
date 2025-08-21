import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/80 backdrop-blur-sm border border-border/50 text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">404</CardTitle>
            <CardDescription className="text-lg">
              Page Not Found
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/commands">
                <Search className="mr-2 h-4 w-4" />
                Browse Commands
              </Link>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
