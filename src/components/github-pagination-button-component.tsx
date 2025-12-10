import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "./ui/button";

export const GithubPaginationButtonComponent = ({
  before,
  after,
  hasPrevPage,
  hasNextPage,
  setControl,
}: {
  before: number;
  after: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  setControl: ({
    before,
    after,
  }: {
    before: string | undefined;
    after: string | undefined;
  }) => void;
}) => {
  return (
    <div className="flex flex-row items-center justify-center gap-5">
      {hasPrevPage === false ? (
        <Button variant={"ghost"} disabled>
          <ChevronLeftIcon />
          Previous
        </Button>
      ) : (
        <Button
          variant={"ghost"}
          onClick={() => {
            setControl({
              before: before + "",
              after: undefined,
            });
          }}
        >
          <ChevronLeftIcon />
          Previous
        </Button>
      )}
      {hasNextPage === false ? (
        <Button variant={"ghost"} disabled>
          Next
          <ChevronRightIcon />
        </Button>
      ) : (
        <Button
          variant={"ghost"}
          onClick={() => {
            setControl({
              before: undefined,
              after: after + "",
            });
          }}
        >
          Next
          <ChevronRightIcon />
        </Button>
      )}
    </div>
  );
};
