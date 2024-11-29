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

function onCreate() {
    console.log('Create task')
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create</Button>
      </DialogTrigger>
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
              defaultValue="Establish a new design system"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minutes" className="text-right">
              Minutes
            </Label>
            <Input
              id="minutes"
              defaultValue="60"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => onCreate()}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
