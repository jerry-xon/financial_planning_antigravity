# Two-Role Authentication System - FinPlan

## Overview

FinPlan now supports a **SaaS-style two-role system** with separate workflows for agents and individual users.

### Roles

1. **Agent** - Financial advisors who create reports for their clients
2. **User** - Individual users who create their own financial reports
3. **Admin** (Special) - Platform admin who manages agents and monitors all reports

---

## Database Schema Updates

### user_profiles Table - New Fields

```sql
role text NOT NULL check (role in ('agent', 'user')) default 'user'
company_name text
phone text
is_approved boolean default false
```

### financial_plans Table - New Fields

```sql
agent_id uuid references auth.users(id) -- Links plan to agent
client_name text -- Client's name (for agent-created plans)
client_email text -- Client's email
```

### Row Level Security (RLS) Policies

**For Agents:**
- Can view and modify plans they created (agent_id = auth.uid())
- Can create plans with client details
- Cannot view other agents' client plans

**For Users:**
- Can only view/modify their own plans (user_id = auth.uid())
- agent_id must be NULL for user-created plans

**For Admins:**
- Full access to all data via Admin Portal

---

## User Flows

### 1. Regular User Flow

```
Signup (Role: User)
    ↓
Email Verification
    ↓
Login to FinPlan App
    ↓
Create Personal Financial Reports
    ↓
View Own Reports
```

**Access Level:**
- Only sees their own financial plans
- Can create unlimited reports
- Full editing capabilities on own reports

---

### 2. Agent Flow

```
Signup (Role: Agent, Company Required)
    ↓
Email Verification
    ↓
Admin Approval (is_approved = false)
    ↓
Once Approved → Login to Agent Dashboard
    ↓
Create Reports for Clients
    ↓
View All Client Reports
```

**Signup Experience:**
- Role selection: Choose "Agent"
- Additional field: Company Name
- Account marked as "Pending Approval"

**Agent Dashboard:**
- List of all client reports created
- Can create new client reports
- Can edit client reports
- Can view client progress
- Agent badge displayed on app

**Access Level:**
- Sees only their own client reports
- Cannot view other agents' reports
- Cannot see regular users' reports
- Can bulk-manage multiple client accounts

---

### 3. Admin Portal Flow

```
Login with Admin Email
    ↓
Redirected to Admin Portal (not FinPlan)
    ↓
View All Agents & Reports
```

**Admin Features:**
- **Overview Tab:**
  - Total agents count
  - Pending approvals count
  - Total reports generated
  - Recent reports list

- **Agents Tab:**
  - List of all agents
  - Company information
  - Approval status
  - Approve/Reject agents
  - Agent contact details

- **Reports Tab:**
  - List of all reports by agents
  - Client names
  - Creating agent information
  - Report timestamps
  - Export capabilities (future)

---

## Implementation Details

### Authentication Service

```javascript
// Updated signup function
signUpWithEmail(email, password, fullName, role = 'user', company = '')

// Updated Google OAuth
signInWithGoogle(role = 'user')
```

### Signup Component

- **Role Selection Screen:**
  - Regular User (default)
  - Agent (shows company field)
  
- **Conditional Fields:**
  - Company Name field only shows for Agent role

### Database Trigger

When user signs up, `handle_new_user()` function:
1. Creates user_profiles record with role
2. Creates initial financial_plans entry
3. Sets is_approved = false for agents

---

## Admin Portal Access

**Admin emails:** Hardcoded in `RoleBasedRouting.jsx`

```javascript
const adminEmails = ['jayeshpurswani2004@gmail.com'];
const isAdmin = user && adminEmails.includes(user.email);
```

**To add more admins:**
1. Edit `src/components/Auth/RoleBasedRouting.jsx`
2. Add email to `adminEmails` array
3. That email gets automatic admin access on login

### Admin Portal Components

Location: `src/components/Admin/AdminDashboard.jsx`

**Tabs:**
1. Overview - Stats and recent activity
2. Agents - Agent management and approval
3. Reports - All generated reports

---

## Agent Approval Workflow

1. **Agent Registration:**
   - Agent signs up with company details
   - Account created with `is_approved = false`

2. **Admin Review:**
   - Admin sees in "Agents" tab
   - Status shows "Pending"

3. **Admin Action:**
   - Click "Approve" to enable agent account
   - Agent can now login
   - Agent badges show on reports

4. **Agent Access:**
   - Once approved, agent can create client reports
   - All reports visible in admin portal

---

## Report Generation & Visibility

### From User Perspective:
- User creates report in FinPlan
- Only that user sees the report
- Automatically visible in admin portal (via RLS)

### From Agent Perspective:
- Agent creates client report
- Inputs client name + email
- Report stored with agent_id
- Only agent can edit
- Visible in admin portal under that agent

### From Admin Perspective:
- Views all reports from all agents
- Sees agent information + client details
- Can monitor progress
- Can track agency activity

---

## Security Model

### Row Level Security (RLS)

```sql
-- User can only see their own plans
WHERE auth.uid() = user_id AND agent_id IS NULL

-- Agent can only see client plans they created
WHERE auth.uid() = agent_id

-- Admin can see everything (via special access)
```

### No Cross-Access:
- Agents cannot see each other's clients
- Users cannot see agent clients
- Clients cannot see each other
- Only admin and the creating agent can view a report

---

## Future Enhancements

1. **Client Portal** - Direct share link to clients to see their reports
2. **Bulk Operations** - Agent can manage multiple clients
3. **Report Export** - PDF/Word export for client delivery
4. **Email Notifications** - Alert agents/admin of approvals
5. **Subscription Plans** - Tiered plans for agents (free: 5 clients, paid: unlimited)
6. **Performance Analytics** - Track agent productivity
7. **Client Feedback** - Clients can comment on reports
8. **Template Reports** - Pre-built templates for agents

---

## Testing Checklist

### User Registration
- [ ] User signup UI shows role selection
- [ ] Agent role shows company field
- [ ] Both roles accept Google OAuth
- [ ] Email verification works

### Agent Workflow
- [ ] Agent signup creates unapproved account
- [ ] Agent cannot login until approved
- [ ] Admin can approve/reject agents
- [ ] Approved agent sees "Agent Account" badge
- [ ] Agent can create client reports

### Admin Portal
- [ ] Admin email bypasses authentication
- [ ] Admin sees all agents
- [ ] Admin sees all reports
- [ ] Approval buttons work
- [ ] Statistics are accurate

### Data Privacy
- [ ] User cannot see agent reports
- [ ] Agent cannot see other agent's reports
- [ ] Agent cannot see regular user reports
- [ ] Admin can see everything

---

## Configuration

### Add Admin Emails

File: `src/components/Auth/RoleBasedRouting.jsx`

```javascript
const adminEmails = [
  'jayeshpurswani2004@gmail.com',
  'admin2@example.com',
  'admin3@example.com'
];
```

### Customize Admin Portal

File: `src/components/Admin/AdminDashboard.jsx`

Modifications:
- Change colors
- Add custom columns
- Add report actions
- Implement email notifications
- Add export functionality

---

## API Endpoints

### New Financial Plan Fields for Agents
```javascript
{
  agent_id: "uuid",        // Creating agent's ID
  client_name: "John Doe", // Client full name
  client_email: "..."      // Client email
}
```

### User Profile Fields
```javascript
{
  role: "agent" | "user",
  company_name: "Company X",
  phone: "+1234567890",
  is_approved: true | false
}
```

---

## Support & Troubleshooting

### Agent Cannot Login
- Check if is_approved = true in admin portal
- Verify email is correct

### Reports Not Showing in Admin Portal
- Check agent_id field is populated
- Verify RLS policies are correct
- Check browser console for errors

### Admin Portal Not Accessible
- Verify email is in adminEmails array
- Clear browser cache
- Logout and login again

---

## Migration Notes

If migrating from old system:
1. Run updated `schema.sql` to add new fields
2. Update existing user records: `UPDATE user_profiles SET role = 'user'`
3. Update financial plans: `UPDATE financial_plans SET agent_id = NULL WHERE agent_id IS NULL`
4. Test admin access with your email
