# Super Admin Dashboard - Frontend

React 18 frontend for managing company subscriptions and approving payments in the multi-tenant ERP system.

## Tech Stack
- **React 18** (JSX)
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Lucide React** for icons
- **Vite** for bundling

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── SuperAdminDashboard.jsx       # Main dashboard with tab navigation
│   │   ├── CompanyManagementTab.jsx      # Company list & block functionality
│   │   └── PaymentApprovalsTab.jsx       # Payment approval interface
│   ├── services/
│   │   └── subscriptionApi.js            # Axios API service layer
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Features

### 1. Company Management Tab
- View all companies with details (ID, Org ID, Name, Email, Status, Created Date)
- Real-time statistics: Total, Active, and Blocked companies
- Block companies with confirmation dialog
- Status badges with color coding (Active=Green, Blocked=Red)
- Refresh functionality to reload data
- Loading states with spinner animations
- Error handling with retry capability

### 2. Payment Approvals Tab
- View pending payments awaiting approval
- Payment details: Company name, System (GINUMA/INVENTORY), Amount, Proof URL
- Clickable proof documents (opens in new tab)
- Statistics: Total pending count and sum of amounts
- Approve payments with confirmation (extends subscription by 1 year)
- Currency formatting (USD by default)
- Empty state when no pending payments

### 3. Main Dashboard
- Tab-based navigation between Company Management and Payment Approvals
- Top navigation bar with logo and logout button
- Responsive design with Tailwind CSS
- Clean, modern UI with consistent styling
- Footer with copyright information

## API Endpoints

The frontend integrates with these Super Admin REST APIs:

1. **GET** `/api/superadmin/subscriptions/companies` - Get all companies
2. **PUT** `/api/superadmin/subscriptions/companies/${orgId}/block` - Block a company
3. **GET** `/api/superadmin/subscriptions/payments/pending` - Get pending payments
4. **POST** `/api/superadmin/subscriptions/payments/${paymentId}/approve` - Approve payment

## Setup Instructions

### 1. Install Dependencies
```bash
cd subscription-service/frontend
npm install
```

### 2. Configure Environment
Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Authentication

JWT tokens are stored in `localStorage` under the key `accessToken`. The Axios interceptor automatically adds the token to all API requests:

```javascript
Authorization: Bearer ${token}
```

On 401 responses, the app automatically redirects to the login page.

## Usage

### Block a Company
1. Navigate to "Company Management" tab
2. Find company with "ACTIVE" status
3. Click red "Block" button
4. Confirm action in dialog
5. Company status updates to "BLOCKED"

### Approve a Payment
1. Navigate to "Payment Approvals" tab
2. Review payment details
3. Click "View Proof" to verify payment document
4. Click green "Approve" button
5. Confirm action in dialog
6. Subscription extends by 1 year

## Component Overview

### subscriptionApi.js
Axios service with automatic JWT token injection and error handling. Exports methods:
- `getCompanies()`
- `blockCompany(orgId)`
- `getPendingPayments()`
- `approvePayment(paymentId)`

### CompanyManagementTab.jsx
- Displays companies in a responsive table
- Shows statistics cards (Total, Active, Blocked)
- Implements block functionality with loading states
- Handles errors with retry mechanism

### PaymentApprovalsTab.jsx
- Displays pending payments in a table
- Shows statistics (Pending count, Total amount)
- Implements approve functionality
- Clickable proof document links
- Currency formatting

### SuperAdminDashboard.jsx
- Main container with top navigation
- Tab switching logic
- Logout functionality
- Responsive layout

## Styling

Built with Tailwind CSS utility classes:
- **Colors**: Blue (primary), Green (success), Red (danger), Yellow (warning)
- **Components**: Cards, tables, buttons, badges, forms
- **Responsive**: Mobile-friendly grid layouts
- **Icons**: Lucide React for consistent iconography

## Future Enhancements

- [ ] Search and filter functionality
- [ ] Pagination for large datasets
- [ ] Sorting capabilities
- [ ] Export to CSV/PDF
- [ ] Real-time notifications
- [ ] Audit log viewer
- [ ] Bulk operations
- [ ] Unblock company functionality
- [ ] Analytics dashboard with charts

## Support

For issues or questions, refer to the main project documentation.
