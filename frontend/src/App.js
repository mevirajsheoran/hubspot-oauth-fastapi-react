import { IntegrationForm } from './integration-form';

/**
 * Main Application Component
 * 
 * This is the root component of the Pipeline AI Integration frontend.
 * It renders the main integration form for managing OAuth2 integrations.
 * 
 * @component
 * @returns {JSX.Element} The main application layout
 */
function App() {
  return (
    <div className="App">
      <IntegrationForm />
    </div>
  );
}

export default App;
