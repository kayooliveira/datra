# Wails API Contract

## App Service

Methods exposed to the frontend via `window.go.main.App`.

### GetConnections

Returns the list of saved connection profiles.

- **Signature**: `GetConnections() []ConnectionProfile`
- **Input**: None
- **Output**: Array of ConnectionProfile objects.
- **Errors**: Returns empty array if file not found or error reading (logs error to console/file).

### Example Usage (Frontend)

```javascript
import { GetConnections } from "../wailsjs/go/main/App";

const [connections, setConnections] = useState([]);

useEffect(() => {
    GetConnections().then((result) => {
        setConnections(result);
    });
}, []);
```
