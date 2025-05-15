import { Users, MessageSquare, TrendingUp } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect with people who matters!
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join millions of people sharing ideas, experiences, and moments that
            make life meaningful.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Communities</h3>
              <p className="text-gray-600">
                Connect with like-minded people and build meaningful
                relationships.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Ideas</h3>
              <p className="text-gray-600">
                Express yourself and engage in meaningful conversations.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Grow Together</h3>
              <p className="text-gray-600">
                Learn, grow, and succeed with a supportive community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
