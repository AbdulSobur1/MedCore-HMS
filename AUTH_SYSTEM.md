# MedCore Authentication System

## Overview

MedCore has a simplified, two-user-type authentication system:
- **Patients**: Self-registration with medical form, login via email + OTP
- **Staff**: Admin-created profiles, login via email + password

## User Flows

### Patient Registration & Login

1. **Landing Page** (`/auth/landing`)
   - Explains platform scope with feature overview
   - "Get Started" button → Patient Registration
   - "Login" button → Unified Login

2. **Patient Registration** (`/auth/register`)
   - Self-service registration form
   - Required fields: Name, Email, Phone, Date of Birth, Gender, Blood Type
   - Optional fields: Address, Emergency Contact
   - Upon submission: Creates patient ID (PAT-XXXXX), stores profile in localStorage
   - Redirects to login page

3. **Patient Login** (`/auth/login` → OTP Step)
   - Enter email address
   - System detects patient type and generates 6-digit OTP
   - OTP is stored in localStorage (for demo, check browser console)
   - Patient enters OTP to verify
   - Creates session token, redirects to `/patient/dashboard`

### Staff Management

1. **Admin Registration** (`/auth/admin/register?key=ADMIN_SECRET_KEY`)
   - Protected by secret admin key (default: `medcore-admin-2024`)
   - Set via `NEXT_PUBLIC_ADMIN_KEY` environment variable
   - Creates initial admin account
   - Redirects to login page

2. **Staff Login** (`/auth/login` → Password Step)
   - Enter email address
   - System detects staff type and asks for password
   - Staff credentials stored in localStorage
   - Creates session token, redirects to `/staff/dashboard`

3. **Staff Creation** (via Admin Dashboard)
   - Admins can create new staff profiles
   - Sends invitation emails (future: implement email service)
   - Staff accepts invite and sets password
   - Can have roles: Admin, Doctor, Pharmacist, Receptionist, Accountant

## Session Management

- Sessions stored in localStorage with 24-hour expiry
- Session token format: Random 36-character string
- AuthContext provides `useAuth()` hook for checking session state
- Protected routes redirect to `/auth/landing` if no session

## Routes

### Public Routes
- `/auth/landing` - Landing page with feature overview
- `/auth/register` - Patient registration
- `/auth/login` - Unified login for patients and staff
- `/auth/admin/register?key=...` - Hidden admin registration

### Protected Routes
- `/patient/dashboard` - Patient dashboard (requires patient session)
- `/staff/dashboard` - Staff dashboard (requires staff session)

## Data Storage (Current Implementation)

Using localStorage for mock implementation:
- `patients` - Object with patient profiles keyed by patientId
- `staffProfiles` - Object with staff profiles keyed by staffId
- `otp_[email]` - OTP storage for patient verification
- `session` - Current user session

**Production**: Replace with secure backend database (Neon, Supabase, etc.)

## Environment Variables

```
NEXT_PUBLIC_ADMIN_KEY=medcore-admin-2024  # Secret key for admin registration
```

## Demo Credentials

To test the system:

1. **Create a patient** (via `/auth/register`)
   - Fill form with test data
   - System generates Patient ID

2. **Login as patient** (via `/auth/login`)
   - Enter patient email
   - OTP appears in browser console (demo mode)
   - Enter OTP to access patient dashboard

3. **Login as staff**
   - Create admin via `/auth/admin/register?key=medcore-admin-2024`
   - Login with admin credentials
   - Admin dashboard allows creating additional staff

## Next Steps (Production)

1. Replace localStorage with real database
2. Implement actual OTP via SMS/Email service
3. Add password reset flow
4. Implement staff invitation emails
5. Add session persistence across page refreshes
6. Implement role-based access control (RBAC)
7. Add audit logging for authentication events
8. Implement 2FA for admin accounts
