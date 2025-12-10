import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";

function SearchInput({
  placeHolder,
  path,
  className,
}: {
  placeHolder: string;
  path: string;
  className?: string;
}) {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");
  const [value, setValue] = React.useState(q ?? "");
  //   const [timer, setTimer] = useState(0);
  const [debouncedInput, setDebouncedInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (value !== q) {
      //   setTimer(3); // Reset the timer
      //   const countdown = setInterval(() => {
      //     setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      //   }, 1000);

      const debounce = setTimeout(() => {
        setDebouncedInput(value);
        //clearInterval(countdown);
      }, 3000);

      return () => {
        clearTimeout(debounce);
        //clearInterval(countdown);
      };
    }
  }, [debouncedInput, q, value]);

  return (
    <div className={cn("w-full max-w-[250px] relative p-1", className)}>
      <Input
        className="w-full bg-white max-w-[250px] h-10 rounded-full pl-5 text-gray-800 pr-10"
        placeholder={placeHolder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            navigate(path + "&q=" + value);
          }
        }}
      />
      <Button
        className="rounded-full absolute right-3 top-3 size-6"
        size={"icon"}
        variant={"ghost"}
        onClick={() => {
          navigate(path + "&q=" + value);
        }}
      >
        <SearchIcon />
      </Button>
    </div>
  );
}

export default SearchInput;
