import { ProfileSetupForm } from "@/components/auth/ProfileSetupForm";
import AuthBrandingPanel from "@/components/auth/AuthBrandingPanel";

const ProfileSetupPage = () => {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <ProfileSetupForm />
      </div>
      <AuthBrandingPanel />
    </div>
  );
};

export default ProfileSetupPage;