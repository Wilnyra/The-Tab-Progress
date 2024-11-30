import { appName } from "@/shared/lib/constants"
import { Button } from "@/shared/ui/button"
import "./index.css"

function App() {
  return (
    <div>
      <h1>{appName} v0.0.0</h1>
      <Button>Click me</Button>
    </div>
  )
}

export default App
