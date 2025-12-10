import Footer from "@/components/footer";
import SignInForm from "./sign-in-form";

export default function LoginPage() {
  return (
    <div className="flex h-screen bg-primary/10 w-screen p-4">
      <div className="flex w-full items-center justify-center bg-white rounded-3xl">
        <div className="flex w-full max-w-xl flex-col gap-5 p-10 md:p-16 lg:p-20">
          <img src="/assets/logo-long.png" />
          <SignInForm />
          <Footer isWhite={true} />
        </div>
      </div>
    </div>
  );
}
