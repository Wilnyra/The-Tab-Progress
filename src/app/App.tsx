import { appName } from "@/shared/lib/constants"
import { Button } from "@/shared/ui/Button"
import "./index.css"

function App() {
  return (
    <div className="dark bg-background">
      <h1 className="text-foreground">{appName} v0.0.0</h1>
      <Button variant="secondary">Click me</Button>
    </div>
  )
}

export default App
