import { Button } from './components/Button/Button'

function App() {
  return (
    <main>
      <h1>__PROJECT_NAME__</h1>
      <p>
        This page is a placeholder — replace it with real content once components exist.
        Design tokens live in <code>src/tokens.css</code>. Each component gets its own folder
        under <code>src/components/</code>, styled only from those tokens.
      </p>
      <p>
        <Button variant="primary">Primary action</Button>{' '}
        <Button variant="secondary">Secondary action</Button>
      </p>
    </main>
  )
}

export default App
