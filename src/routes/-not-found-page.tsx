import { ArrowLeftIcon, CompassIcon } from "@phosphor-icons/react";
import { Link, useRouter, useCanGoBack } from "@tanstack/react-router";
import { Footer } from "../components/section/footer";
import { Button, buttonVariants } from "../components/ui/button";

export function NotFoundRoot() {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  function goBack() {
    if (canGoBack) return router.history.back();
    router.navigate({ to: "/" });
  }

  return (
    <main className="bg-background text-foreground flex min-h-svh flex-col justify-between">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="border-border bg-muted/30 mb-6 flex size-14 items-center justify-center rounded-full border">
          <CompassIcon className="text-muted-foreground size-7" weight="light" />
        </div>

        <span className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase">
          404 — Page not found
        </span>

        <h1 className="text-primary font-serif text-3xl sm:text-4xl">Lost in the stacks.</h1>

        <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
          The page you're looking for doesn't exist or may have been moved elsewhere in the library.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={goBack} className="rounded-sm">
            <ArrowLeftIcon className="size-3.5" /> Go back
          </Button>

          <Link to="/" className={buttonVariants({ variant: "default" })}>
            Return home
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
