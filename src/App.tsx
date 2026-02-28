import { ErrorBoundary } from './components/ErrorBoundary'
import { GameContainer } from './components/GameContainer'

function App() {
  return (
    <ErrorBoundary>
      <GameContainer />
    </ErrorBoundary>
  )
}

export default App
