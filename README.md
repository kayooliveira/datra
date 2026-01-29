# Datra

**Datra** is a modern, high-performance, and lightweight desktop database manager built with Go and React. It provides an IDE-style experience for developers to manage their databases efficiently.

## 🚀 Features

- **Cross-Platform**: Native desktop experience on macOS, Windows, and Linux.
- **Modern UI**: Clean, responsive interface built with React and styled with an IDE-style aesthetic.
- **Type-Safe Routing**: Powered by TanStack Router for seamless and robust navigation.
- **High Performance**: Leverages Go (Wails) for backend operations and system interactions.
- **I18n Support**: Multi-language support (currently English and Portuguese).
- **Security First**: Designed with safe credential handling and secure database connections.

## ⌨️ Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| New Connection | `Cmd + N` | `Ctrl + N` |
| Go Home | `Cmd + H` | `Ctrl + H` |
| Open Settings | `Cmd + ,` | `Ctrl + ,` |

## 🛠️ Technology Stack

- **Backend**: [Go 1.23](https://golang.org/) + [Wails v2](https://wails.io/)
- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Custom CSS with CSS Variables for Theme Support (Light/Dark)

## 📦 Getting Started

### Prerequisites

- [Go](https://golang.org/dl/) (1.23+)
- [Node.js](https://nodejs.org/) & [NPM](https://www.npmjs.com/)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kayooliveira/datra.git
   cd datra
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Development

To run the application in live development mode:

```bash
wails dev
```

This will start the Wails application with hot-reload enabled for both Go and React code.

### Building

To build a production-ready binary for your current OS:

```bash
wails build
```

The output will be located in the `build/bin` directory.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.