# RAL HR System Backend

Express and MongoDB API for the RAL HR management system. It supports employee self-service, manager team workflows, and HR administration.

## Technology

- Node.js and Express 5
- MongoDB and Mongoose
- JSON Web Tokens and bcrypt
- Multer file uploads
- Morgan request logging
- Jest and Supertest

## Setup

Install dependencies:

```bash
npm install
```

Create `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=replace-with-a-secure-secret
CLIENT_URL=http://localhost:5173
```

Run the API:

```bash
npm run dev
```

Other commands:

```bash
npm start  # Start with Node
npm test   # Run Jest tests (requires database access)
```

## API conventions

- Default URL: `http://localhost:3000`
- Protected endpoints require `Authorization: Bearer <token>`.
- Roles are `employee`, `manager`, and `hr_admin`.
- CORS allows `CLIENT_URL`, `http://localhost:5173`, and `http://127.0.0.1:5173`.

## Implemented APIs

### Authentication — `/auth`

- Sign up and sign in
- Verify and return the current user

### Employees — `/Employees`

- HR creates employee/user accounts, lists employees and managers, updates records, and changes status.
- Authenticated users retrieve their profile and update contact information.
- Managers retrieve direct reports and employees in their department.
- HR and managers retrieve permitted employee details.

`Employee.reports_to` stores an Employee ID, so manager team queries use the manager’s linked `employeeId`.

### Attendance — `/attendance`

- Employees and managers retrieve personal history and today’s record.
- Managers retrieve direct-report attendance.
- HR retrieves all/today/employee attendance, corrects records, and locks records.
- Authorized users retrieve attendance details.

Employees can only open their own attendance details. Managers can open their own and their direct reports’ records.

### Check-ins — `/checkIn`

- Authenticated users check in, check out, and view personal history.
- HR views all check-ins or one employee’s history.

### Attendance corrections — `/attendance-corrections`

- Manager correction-request creation and approval
- Role-filtered lists and details
- HR correction processing
- Rejection workflow

### Leave types — `/leave`

- Authenticated users list and view leave types.
- HR creates, updates, activates, and deactivates leave types.
- Rules include service/document requirements, carry-forward limits, lifetime limits, pay fractions, and maternity/paternity restrictions.

### Leave allocations — `/leave-allocation`

- Employees retrieve personal allocations.
- Managers retrieve their own and direct reports’ allocations, optionally filtered by employee.
- HR creates, retrieves, updates, and deletes organization allocations.

Remaining leave equals allocated days plus carried-forward days minus days taken.

### Leave requests — `/leave-request`

- Create requests as drafts or submit immediately
- Edit and submit drafts
- Approve, reject, cancel, and delete where authorized
- Role-filtered lists and details
- Supporting-document upload and secure download

The workflow checks allocations, balance, overlaps, weekends, confirmed holidays, service/document requirements, and assigned approvers. `approver_id` comes from the employee’s `reports_to` Employee ID.

### Employee documents — `/documents`

- Employees upload, list, update, and view personal documents and expiry alerts.
- HR lists documents, uploads for employees, edits, reviews, rejects, and deactivates documents.
- New employee uploads store the linked Employee ID.
- Reads also resolve legacy documents that stored a User ID, allowing HR screens to display the correct employee without rewriting old records.

### Departments — `/departments`

- Authenticated users list and view departments.
- HR creates and updates departments.

### Holidays — `/holidays`

- Authenticated users list and view holidays.
- HR creates, updates, and deletes holidays.

### Audit logs — `/audit-logs`

- HR-only audit-log list, details, and record history
- Audit records are produced by supported employee, document, attendance, leave, and administrative operations.

## File uploads

Multer stores uploads in `backend/image/` and creates the directory when required.

Stored filenames use:

```text
<timestamp>-<sanitized-original-name>
```

Example:

```text
1788372496759-Sayed-Ali-Mustafa-Alkamel-CV.pdf
```

Restrictions:

- Maximum size: 5 MB
- MIME types: PDF, JPEG, and PNG
- Unsafe filename characters are replaced with hyphens

Files are served from `/image/<filename>`. Leave attachments are downloaded through an authorization-checked endpoint.

## Active data models

- User
- Employee
- Department
- Holiday
- LeaveType
- LeaveAllocation
- LeaveRequest
- Checkin
- Attendance
- AttendanceCorrection
- EmployeeDocument
- AuditLog

Payroll, salary, company, designation, shift, and statutory-setting models also exist, but they are not documented as completed modules because they lack corresponding API routes and full frontend workflows.

## Notes

- Employee and manager accounts must be linked to an Employee record for personal and team-scoped operations.
- HR employee totals include `employee` and `manager` roles, not HR-admin accounts.
- Employee documents and leave attachments share the image upload directory.
