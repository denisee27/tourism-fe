import { Plane, Sparkles, Map, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

function MainPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Plane className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold text-foreground">TravelMind</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hover:cursor-pointer hover:bg-primary-light hover:text-white rounded-md px-4 py-2" variant="ghost" onClick={() => navigate("/login")}>
                            Login
                        </button>
                        <button type="button" className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90 cursor-pointer" onClick={() => navigate("/login")}>Get Started</button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 bg-primary-lighter rounded-full px-4 py-2 mb-4">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">AI-Powered Travel Planning</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                        Your Personal AI
                        <br />
                        <span className="text-primary">Tourism Planner</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Plan your perfect trip with AI assistance. From flights to visas, hotels to itineraries—all organized in one intelligent conversation.
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-6">
                        <button size="lg" className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90 cursor-pointer" onClick={() => navigate("/app")}>
                            Start Planning
                        </button>
                        <button size="lg" className="border border-primary-light text-primary rounded-md px-4 py-2 hover:bg-primary-light hover:text-white cursor-pointer" variant="outline">
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
                    <div className="bg-card border border-border rounded-lg p-6 text-left hover:shadow-lg transition-all">
                        <div className="h-12 w-12 bg-primary-lighter rounded-lg flex items-center justify-center mb-4">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-2">AI Conversations</h3>
                        <p className="text-muted-foreground">
                            Chat naturally with our AI to plan every detail of your trip
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 text-left hover:shadow-lg transition-all">
                        <div className="h-12 w-12 bg-primary-lighter rounded-lg flex items-center justify-center mb-4">
                            <Map className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-2">Organized Planning</h3>
                        <p className="text-muted-foreground">
                            Flights, visas, hotels—everything organized in easy-to-access tabs
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 text-left hover:shadow-lg transition-all">
                        <div className="h-12 w-12 bg-primary-lighter rounded-lg flex items-center justify-center mb-4">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-2">Smart Itineraries</h3>
                        <p className="text-muted-foreground">
                            Get personalized day-by-day plans based on your preferences
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border mt-20">
                <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
                <p>© 2025 TravelMind. Powered by AI.</p>
                </div>
            </footer>
        </div>
    )
}

export default MainPage