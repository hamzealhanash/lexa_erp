# 🚀 Lexa ERP v0.1.3 - Security, Hardware & CI/CD Updates

This update brings critical security enhancements with per-machine database encryption, reliable hardware integrations for retail environments, and a streamlined build process.

## ✨ New Features
* **Encrypted Local Storage:** Implemented `SQLCipher` to encrypt the local SQLite database on a strict per-machine basis, ensuring peak security for your enterprise data when at rest.
* **Thermal POS Printer Integration:** Added direct driverless integration with thermal point-of-sale receipt printers (`electron-pos-printer`), allowing immediate, stable print feedback directly to the checkout UI.
* **Auto-Updater Engine:** Built-in integration with `electron-updater` so that future app updates will reliably silently download in the background.

## 🛠️ Architecture & Build Improvements
* **Cross-Platform CI/CD:** Fully automated our build pipeline via **GitHub Actions**. From a single tag push, the CI now reliably constructs Windows (NSIS), macOS (DMG), and Linux (AppImage) distributions automatically.
* **Vite/Rollup Optimizations:** Radically decoupled the backend/frontend processes. Crucial node packages (like SQLite bindings and printer services) are correctly preserved and externalized, completely removing native `.node` extension conflict errors and `__filename` reference crashes.

## 🐛 Bug Fixes
* **Database Date Standardization:** Hardened SQL data ingestion by standardizing our Date Schema processing to align strictly with ISO-8601 Strings. Database logic now correctly registers time properties, completely resolving grouping failure bugs (`null` dates).
* **UI Anti-Aliasing & Selection Limits:** Globally locked and disabled text-highlighting on UI placeholder labels to make inputs feel snappier and prevent accidental drag-selection tearing.
* **Type-safety Guards:** Resolved critical typescript intersection errors blocking dynamic comparisons on IDs like `contract_id` in React Comboboxes fields.
