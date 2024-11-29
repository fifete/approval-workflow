"use client";

import { Button } from "@/app/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { api } from "~/trpc/react"
import { useState } from "react";
import { Roles } from "~/server/api/constants/enums";

export function DialogDemo({ refetchRequests, userRole }: { refetchRequests: () => void, userRole: Roles.LEADER | Roles.WORKER }) {
  const [description, setDescription] = useState("Establish a new design system");
  const [minutes, setMinutes] = useState(60);
  const [isOpen, setIsOpen] = useState(false);
  const createMutation = api.request.create.useMutation();

  const onCreate = () => {
    createMutation.mutate({
      description,
      minutes
    }, {
      onSuccess: () => {
        setIsOpen(false);
        refetchRequests();
        console.log('Task created');
      },
      onError: (e) => {
        console.log('error ', e);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {userRole == Roles.WORKER && (
        <DialogTrigger asChild>
          <Button variant="outline">Create</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]" style={{ backgroundColor: 'white' }}>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minutes" className="text-right">
              Minutes
            </Label>
            <Input
              id="minutes"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onCreate}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
