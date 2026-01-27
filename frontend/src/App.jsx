import { CommandIcon, DatabaseIcon, PlusIcon } from "lucide-react";

function App() {
  return (
    <div>
      <header></header>
      <main>
        <h1>No Database Connections</h1>
        <p>
          Create a connection to start exploring and querying your databases.
          Datra supports PostgreSQL, MySQL, SQLite, and more.
        </p>
        <DatabaseIcon size={120} strokeWidth={1} />
        <button>
          Create New Connection <PlusIcon size={16} />
        </button>
      </main>
      <footer>
        <span>
          <CommandIcon size={16} /> + N New Connection
        </span>
        <span>
          <CommandIcon size={16} /> + O Open File (.datra)
        </span>
      </footer>
    </div>
  );
}

export default App;
