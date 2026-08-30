import { GoogleLogoIcon, SignInIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client.ts";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LoginFormSchema, RegisterFormSchema } from "./schema";
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

function LastMethodBadge() {
  return (
    <span className="bg-secondary text-accent absolute right-1 rounded-xs p-0.5 text-xs font-normal">
      Last used
    </span>
  );
}

export function LoginModal({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const lastMethod = authClient.getLastUsedLoginMethod();

  async function handleLogin(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const { success, data, error } = LoginFormSchema.safeParse({
      email: formData.get("email")?.toString().trim(),
      password: formData.get("password")?.toString(),
    });

    if (!success) {
      toast.error(error.issues[0].message);
      return;
    }

    await authClient.signIn.email(data, {
      onError: ({ error }) => {
        toast.error(error?.message || "Something went wrong. Please try again.");
      },
    });
  }

  async function handleRegister(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const { success, data, error } = RegisterFormSchema.safeParse({
      email: formData.get("email")?.toString().trim(),
      password: formData.get("password")?.toString(),
      name: formData.get("name")?.toString().trim(),
    });

    if (!success) {
      toast.error(error.issues[0].message);
      return;
    }

    await authClient.signUp.email(data, {
      onError: ({ error }) => {
        toast.error(error?.message || "Something went wrong. Please try again.");
      },
    });
  }

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social(
      { provider: "google", callbackURL: "/?signedIn=true" },
      {
        onError: ({ error }) => {
          toast.error(error?.message || "Something went wrong. Please try again.");
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="group border-primary text-primary hover:bg-primary hover:text-primary-foreground flex items-center gap-2 border p-2 pr-3 text-sm"
          />
        }
        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground border px-4 py-2 text-sm"
      >
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
          <form
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="mt-7 space-y-4"
          >
            {mode === "register" && (
              <label className="text-primary block text-sm">
                Name
                <Input
                  type="text"
                  name="name"
                  autoFocus
                  required
                  className="border-border focus:border-accent mt-2 w-full border-b bg-transparent px-0 py-2 outline-none"
                />
              </label>
            )}
            <label className="text-primary block text-sm">
              Email
              <Input
                type="email"
                name="email"
                required
                autoFocus
                className="border-border focus:border-accent mt-2 w-full border-b bg-transparent px-0 py-2 outline-none"
              />
            </label>
            <label className="text-primary block text-sm">
              Password
              <Input
                type="password"
                name="password"
                required
                className="border-border focus:border-accent mt-2 w-full border-b bg-transparent px-0 py-2 outline-none"
              />
            </label>

            <Button
              type="submit"
              className="relative mt-3 flex w-full items-center px-5 py-3 text-sm font-bold"
              variant="outline"
            >
              <SignInIcon size={20} weight="bold" />
              {mode === "login" ? "Log in" : "Create account"}
              {lastMethod === "email" && <LastMethodBadge />}
            </Button>
          </form>

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="relative text-sm font-bold"
          >
            <GoogleLogoIcon size={20} weight="bold" />
            Sign in with Google
            {lastMethod === "google" && <LastMethodBadge />}
          </Button>
          <DialogClose
            render={<Button variant="destructive" className="py-4 text-sm font-semibold" />}
          >
            Cancel
          </DialogClose>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
