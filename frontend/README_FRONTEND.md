# Laptop Issue Tracker - Frontend

A production-ready React application for managing laptop requests, issues, and extensions in educational institutions.

## 🚀 Features

### For Students

- **Authentication**: Sign up and login with secure JWT authentication
- **Laptop Requests**: Submit and track laptop requests
- **Issue Tracking**: View current and historical laptop assignments
- **Extension Requests**: Request deadline extensions with justification
- **Notifications**: Real-time notifications for request updates

### For Managers

- **Dashboard**: Overview of inventory and pending requests
- **Laptop Management**: Add, edit, and track laptop inventory
- **Request Approval**: Review and approve/reject student requests
- **Issue Management**: Monitor active laptops, overdue returns
- **Extension Approval**: Review and process extension requests

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **React Router** for navigation
- **Zustand** for state management
- **shadcn/ui** components (production-ready UI library)
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hook Form** for form management
- **date-fns** for date formatting
- **Sonner** for toast notifications

## 📦 Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Update the API base URL in `.env`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🎯 Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Build for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── api-client.ts    # Axios configuration
│   └── utils.ts         # Utility functions
├── pages/
│   ├── auth/            # Authentication pages
│   ├── student/         # Student portal pages
│   └── manager/         # Manager portal pages
├── services/            # API service modules
│   ├── auth.service.ts
│   ├── student.service.ts
│   └── manager.service.ts
├── store/               # Zustand stores
│   ├── auth.store.ts
│   └── notification.store.ts
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx              # Main app with routing
└── main.tsx             # Entry point
```

## 🔐 Authentication Flow

1. **Student Signup**: `/signup` - Register new student account
2. **Login**: `/login` - Login for students or managers
3. **Protected Routes**: Automatic redirect based on role
   - Students: `/student/*`
   - Managers: `/manager/*`

## 📱 Pages

### Public Pages

- `/login` - Login page (tabs for Student/Manager)
- `/signup` - Student registration

### Student Portal (`/student/*`)

- `/student` - Dashboard
- `/student/requests` - Laptop requests
- `/student/issues` - Laptop issues
- `/student/extensions` - Extension requests
- `/student/notifications` - Notifications

### Manager Portal (`/manager/*`)

- `/manager` - Dashboard
- `/manager/laptops` - Laptop inventory
- `/manager/requests` - Review laptop requests
- `/manager/issues` - Track issued laptops
- `/manager/extensions` - Review extensions

## 🎨 UI Components

All UI components are from **shadcn/ui**, a production-ready component library:

- ✅ Button, Card, Dialog, Form
- ✅ Input, Textarea, Select, Checkbox
- ✅ Table, Tabs, Badge, Avatar
- ✅ Dropdown Menu, Popover, Calendar
- ✅ Toast notifications (Sonner)
- ✅ Skeleton loaders

## 📡 API Integration

All API calls are handled through service modules:

### Auth Service

- `studentSignup(data)` - POST /auth/student/signup
- `studentLogin(data)` - POST /auth/student/login
- `managerLogin(data)` - POST /auth/manager/login

### Student Service

- `createLaptopRequest(data)` - POST /student/laptop-requests
- `getMyLaptopRequests()` - GET /student/laptop-requests
- `getLaptopIssueHistory()` - GET /student/laptop-issues
- `getActiveLaptopIssue()` - GET /student/laptop-issues/active
- `createExtensionRequest(data)` - POST /student/extension-requests
- `getMyExtensionRequests()` - GET /student/extension-requests
- `getMyNotifications()` - GET /student/notifications

### Manager Service

- `addLaptop(data)` - POST /manager/laptops
- `getAllLaptops()` - GET /manager/laptops
- `updateLaptop(id, data)` - PUT /manager/laptops/:id
- `deleteLaptop(id)` - DELETE /manager/laptops/:id
- `approveLaptopRequest(id, data)` - POST /manager/laptop-requests/:id/approve
- `rejectLaptopRequest(id, reason)` - POST /manager/laptop-requests/:id/reject
- `markLaptopAsReturned(id)` - PUT /manager/laptop-issues/:id/return
- `approveExtensionRequest(id)` - POST /manager/extension-requests/:id/approve
- `rejectExtensionRequest(id, reason)` - POST /manager/extension-requests/:id/reject

## 🔒 State Management

### Auth Store

- User authentication state
- Token management
- Auto-redirect on auth state change

### Notification Store

- Notification list
- Unread count
- Mark as read functionality

## 🎯 Form Validation

All forms use **react-hook-form** with built-in validation:

- Email format validation
- Password strength (min 6 chars)
- Required fields
- Custom validation rules
- Real-time error messages

## 🌐 Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📝 Code Standards

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** compatible
- **Component-based** architecture
- **Responsive design** (mobile-first)
- **Accessibility** compliant

## 🚀 Production Deployment

1. Build the application:

```bash
npm run build
```

2. The `dist/` folder contains the production build

3. Deploy to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

### Environment Variables for Production

Set the following in your hosting platform:

```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 🔧 Troubleshooting

### API Connection Issues

- Check `.env` file exists and has correct API URL
- Ensure backend is running on the specified port
- Check CORS configuration on backend

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Clear `node_modules` and reinstall if needed
- Check TypeScript errors with `npm run build`

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Zustand](https://github.com/pmndrs/zustand)

## 📄 License

This project is part of the Laptop Issue Tracker system.

---

**Built with ❤️ using shadcn/ui and modern React**
