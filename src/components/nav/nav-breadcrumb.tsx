import { formatTitleCaseString } from "@/lib/textHelper";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

function NavBreadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;
  const [, ...paths] = pathname.split("/");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((url, index) => {
          // last element
          if (index === paths.length - 1) {
            return (
              <BreadcrumbItem key={index}>
                <BreadcrumbPage>
                  {formatTitleCaseString(decodeURIComponent(url))}
                </BreadcrumbPage>
              </BreadcrumbItem>
            );
          }
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={
                      index > 0
                        ? paths
                            .slice(0, index)
                            .map((link) => "/" + link + "/")
                            .join("") + url
                        : "/" + url
                    }
                  >
                    {formatTitleCaseString(decodeURIComponent(url))}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default NavBreadcrumb;
