/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CarGateForm from "./car-gate.from";

export function CarGateCombobox({
  CAR_GATES,
  checkoutDetails,
  setSelectedCarGate,
  setIsConfirmDialogOpen,
  openPanel,
  refetchCarGates,
}: any) {
  const [open, setOpen] = React.useState(false);

  const selectedGate = CAR_GATES?.data.find(
    (g: any) => g.id + "" === checkoutDetails.carGateId,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-12 justify-between rounded-2xl bg-slate-50 border-none"
        >
          {selectedGate ? selectedGate.gateName : "Select Gate"}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0 rounded-xl shadow-xl">
        <Command>
          {/* 🔍 Search Input */}
          <CommandInput placeholder="Search gate..." />

          <CommandEmpty>No gate found.</CommandEmpty>

          <CommandGroup>
            {CAR_GATES?.data.map((gate: any) => (
              <CommandItem
                key={gate.id}
                value={gate.gateName}
                onSelect={() => {
                  setSelectedCarGate(gate.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    checkoutDetails.carGateId === gate.id
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                />
                {gate.gateName}
              </CommandItem>
            ))}
          </CommandGroup>

          {/* ➕ Add New */}
          <div className="border-t">
            <Button
              className="w-full text-xs"
              variant="ghost"
              type="button"
              onClick={() => {
                setOpen(false);
                setIsConfirmDialogOpen(false);

                openPanel({
                  title: "Create New CarGate",
                  content: (
                    <CarGateForm
                      initialData={null}
                      onSubmitComplete={() => refetchCarGates()}
                    />
                  ),
                });
              }}
            >
              + Add car gate
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
