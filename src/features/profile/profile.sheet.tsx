import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getProfile } from "@/features/profile/profile.action";
import ProfileForm from "@/features/profile/profile.form";
import ErrorLog from "@/layout/error-log";
import { useQuery } from "@tanstack/react-query";
import { UserIcon } from "lucide-react";
import LoadingPage from "../common/loading.page";

function ProfileSheet() {
  const { data, error, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const data = await getProfile();
      if (data.response) {
        return data.response;
      } else {
        throw data.error;
      }
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-accent hover:text-accent-foreground">
          <UserIcon className="mr-2 size-4" />
          <span className="text-sm">Profile</span>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        {error ? (
          <ErrorLog errors={[error]} />
        ) : data ? (
          <ProfileForm
            data={data.result.payload}
            onSubmitComplete={() => {
              refetch();
            }}
          />
        ) : (
          <LoadingPage />
        )}
      </SheetContent>
    </Sheet>
  );
}

export default ProfileSheet;
