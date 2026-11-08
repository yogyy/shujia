import { Link, useRouterState } from "@tanstack/react-router";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";

export function RouterBreadcrumb() {
  const router = useRouterState();
  const pathSegments = router.location.pathname
    .split("/")
    .filter(Boolean)
    .map((segment, i, segments) => ({
      label: segment,
      path: `/${segments.slice(0, i + 1).join("/")}`,
    }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((route, i) => {
          const isLast = i === pathSegments.length - 1;

          return (
            <Fragment key={`${i}-${route.label}`}>
              <BreadcrumbItem className="capitalize">
                {isLast ? (
                  <BreadcrumbPage className="font-semibold">{route.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={route.path} />}>{route.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
