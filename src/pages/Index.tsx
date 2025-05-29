
import { useAuth } from "@/contexts/AuthContext";
import LogoutButton from "@/components/LogoutButton";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with logout button */}
      <div className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
          meetdown
        </h1>
        <LogoutButton />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome back{user?.email ? `, ${user.email}` : ''}!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Are you down to meet?
          </p>
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600">
              You're now logged in and ready to start connecting with others. 
              This is your protected dashboard where you can manage your meetdowns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
