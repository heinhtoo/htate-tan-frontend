import WarehouseUserSignInForm from "./warehouse-user-sign-in-form";

function SignInForm() {
  return (
    <div className="flex max-w-md flex-col gap-5">
      <div className="flex flex-col gap-8">
        <WarehouseUserSignInForm />
      </div>
    </div>
  );
}

export default SignInForm;
