import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ServerPage from "@/features/common/server-page";
import { QrCode } from "lucide-react";

export function QRButton() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <QrCode />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full sm:max-w-max">
          <DialogHeader>
            <DialogTitle>QR</DialogTitle>
            <DialogDescription>Connect qr code from mobile</DialogDescription>
          </DialogHeader>
          <ServerPage />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
