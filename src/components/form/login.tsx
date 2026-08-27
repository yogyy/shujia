import { CheckIcon, GoogleLogoIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "#/lib/auth-client.ts";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LoginModal({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"login" | "register">("login");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const name = formData.get("name")?.toString().trim();
    if (!email || !password || (mode === "register" && !name)) {
      toast.error("Please complete all fields.");
      return;
    }

    await signIn.email(
      {
        email,
        password,
      },
      {
        onError: ({ error }) => {
          toast.error(error?.message || "Something went wrong. Please try again.");
        },
        onSuccess: () => {
          toast.success("Welcome back.");
        },
      },
    );
  }

  const handleGoogleSignIn = async () => {
    await signIn.social(
      { provider: "google" },
      {
        onError: ({ error }) => {
          toast.error(error?.message || "Something went wrong. Please try again.");
        },
        onSuccess: () => {
          toast.success("Welcome back.");
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger className="border-primary text-primary hover:bg-primary hover:text-primary-foreground border px-4 py-2 text-sm">
        {children}
      </DialogTrigger>
      <DialogOverlay className="bg-primary/35" />
      <DialogContent
        showCloseButton={false}
        className="bg-background h-svh w-full max-w-svw items-center p-10 shadow-2xl sm:h-fit sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-accent text-xs tracking-[0.25em] uppercase">
            Your reading room
            <p
              id="auth-title"
              className="text-primary mt-3 font-serif text-[clamp(24px,6vw,2.25rem)] text-balance"
            >
              {mode === "login" ? "Welcome back." : "Join the shelf."}
            </p>
          </DialogTitle>
          <DialogDescription className="border-border mt-7 flex border-b">
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setMode(tab);
                }}
                className={`w-1/2 border-b-2 p-1.5 px-1 text-sm capitalize ${mode === tab ? "border-accent text-primary font-semibold" : "text-muted-foreground border-transparent"} ${tab === "register" ? "ml-6" : ""}`}
              >
                {tab === "login" ? "Log in" : "Register"}
              </button>
            ))}
          </DialogDescription>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {mode === "register" && (
              <label className="text-primary block text-sm">
                Name
                <Input
                  name="name"
                  className="border-border focus:border-accent mt-2 w-full border-b bg-transparent px-0 py-2 outline-none"
                />
              </label>
            )}
            <label className="text-primary block text-sm">
              Email
              <Input
                type="email"
                name="email"
                className="border-border focus:border-accent mt-2 w-full border-b bg-transparent px-0 py-2 outline-none"
              />
            </label>
            <label className="text-primary block text-sm">
              Password
              <Input
                type="password"
                name="password"
                className="border-border focus:border-accent mt-2 w-full border-b bg-transparent px-0 py-2 outline-none"
              />
            </label>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 flex w-full items-center justify-center gap-2 px-5 py-3 text-sm">
              {mode === "login" ? "Log in" : "Create account"}
              <CheckIcon className="h-4 w-4" />
            </button>
          </form>
          <button
            onClick={handleGoogleSignIn}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 flex w-full items-center justify-center gap-2 px-5 py-3 text-sm"
          >
            <GoogleLogoIcon size={20} />
            Sign in with Google
          </button>
          <DialogClose className="bg-secondary text-primary hover:bg-secondary/90 mt-3 flex w-full items-center justify-center gap-2 px-5 py-3 text-sm">
            Cancel
          </DialogClose>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
