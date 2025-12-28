import { Settings } from 'lucide-react'
import { useState } from 'react'
import { AppearanceTab } from './AppearanceTab'
import { AccountTab } from './AccountTab'
import { buttonVariants } from '@/shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/Dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs'

export const SettingsModal = (): JSX.Element => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
        aria-label="Open settings"
      >
        <Settings />
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your application preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <AccountTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
