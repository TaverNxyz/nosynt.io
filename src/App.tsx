import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/useAuth";
import { BootScreen } from "./components/BootScreen";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import ApiKeys from "./pages/ApiKeys";
import Auth from "./pages/Auth";
import Commands from "./pages/Commands";
import Analytics from "./pages/Analytics";
import Providers from "./pages/Providers";
import Implementation from "./pages/Implementation";
import Security from "./pages/Security";
import Premium from "./pages/Premium";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showBootScreen, setShowBootScreen] = useState(true);

  const handleBootComplete = () => {
    setShowBootScreen(false);
  };

  if (showBootScreen) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark">
        <TooltipProvider>
          <BootScreen onBootComplete={handleBootComplete} />
        </TooltipProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/commands" element={<Commands />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/api-keys" element={<ApiKeys />} />
                  <Route path="/providers" element={<Providers />} />
                  <Route path="/implementation" element={<Implementation />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/premium" element={<Premium />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
