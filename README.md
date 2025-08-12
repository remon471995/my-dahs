# Sales Report System

A web application for managing sales reports with data storage using localStorage.

## Features

- Sales report form with comprehensive fields for booking, customer, service, and payment information
- Local storage integration for saving reports
- Saved reports viewer with detailed report information
- Responsive design for desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 14+ and pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sales-report-system.git
cd sales-report-system

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

### Building for Production

```bash
# Build the project
pnpm build

# Preview the production build
pnpm preview
```

## How to Push to GitHub

1. Create a new repository on GitHub
2. Initialize Git in the project folder (if not already done):
   ```bash
   git init
   ```

3. Add all files to Git:
   ```bash
   git add .
   ```

4. Commit the files:
   ```bash
   git commit -m "Initial commit"
   ```

5. Add your GitHub repository as remote:
   ```bash
   git remote add origin https://github.com/yourusername/sales-report-system.git
   ```

6. Push to GitHub:
   ```bash
   git push -u origin main
   ```

## Data Storage

The application uses browser localStorage to store report data. This means:
- Data is saved in the user's browser
- Data persists between sessions on the same device
- Data is not shared between different devices or users

To implement a more robust storage solution, consider integrating with a backend service like Firebase, Supabase, or a custom API.

## Technologies Used

- React
- TailwindCSS
- Vite

## License

This project is licensed under the MIT License - see the LICENSE file for details.