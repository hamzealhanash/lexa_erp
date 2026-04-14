# Lexa ERP <img src="build/icon.png" width="32" height="32" />

**Lexa ERP** is a modern, high-performance desktop Enterprise Resource Planning (ERP) application built with **Electron**, **React**, and **SQLite**. It provides a robust solution for managing inventory, sales, billing, and collections with a focus on speed, security, and an exceptional user experience.

---

## ✨ Key Features

- **📦 Inventory Management**: Track items, manage categories, and handle records with precision.
- **🧾 Billing & Sales**: Quick bill generation, purchase tracking, and detailed sales analytics.
- **💳 Collection Tracking**: Manage payments, monitor delivery statuses, and track remaining balances.
- **📈 Catalog & Contracts**: Organize companies and manage percentage-based contracts seamlessly.
- **🔒 Secure by Design**: Database encryption using **SQLCipher** (via `better-sqlite3-multiple-ciphers`) with machine-specific keys.
- **🗄️ Modular DataBase**: The database is built with a modular architecture that allows for easy addition of new tables and columns.
- **🌍 Localization**: Full support for **English** and **Arabic** (RTL) out of the box.
- **🌓 Adaptive Theme**: Sleek Dark and Light modes using modern design principles.
- **🖨️ Thermal Printing**: Direct integration with POS printers for instant receipts.
- **🔄 Auto-Updater**: Built-in service to ensure the application is always up-to-date.
- **⌨️ Global Shortcuts**: Power-user navigation with customizable keyboard shortcuts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Base UI](https://base-ui.com/)
- **Data Management**: [TanStack Table](https://tanstack.com/table) & [Virtual](https://tanstack.com/virtual)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend / Desktop
- **Runtime**: [Electron](https://www.electronjs.org/)
- **Database**: [SQLite](https://sqlite.org/) (Encrypted with SQLCipher)
- **State**: `electron-store` for persistent settings.
- **Printing**: `electron-pos-printer`
- **Updates**: `electron-updater`

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/) (Preferred package manager but you can use npm or yarn)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/hamzealhanash/lexa_erp.git
   cd lexa_erp
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start development mode:
   ```bash
   pnpm dev
   ```

### Building for Production
To package the app for your operating system:
```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux

# All platforms
pnpm build:All
```

---

## 📁 Project Structure

```text
lexa_erp/
├── src/
│   ├── electron/        # Main process, IPC handlers, Services (DB, Printer, etc.)
│   ├── frontend/        # React components, Pages, Hooks, Libs
│   └── global-types.d.ts # Shared TypeScript definitions
├── electron-builder.yml # Electron builder configuration
├── vite.config.ts       # Vite & Electron integration config
└── package.json         # Scripts and dependencies
```

---

## 🛡️ Security
The application uses **safeStorage** and **SQLCipher** to ensure that data is encrypted uniquely per machine. This prevents unauthorized access to the database files on the disk.

---

## 📄 License
*Add license information here or contact me for details.*

---

**Lexa ERP** - *Engineering Efficiency for the Modern Enterprise.*
