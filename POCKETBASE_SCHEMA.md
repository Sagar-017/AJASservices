# PocketBase Schema for AJAS Services Scheduler Module

## Overview
This document outlines the required PocketBase collections and schema for the AJAS Services Scheduler module.

## Collections

### 1. `users` Collection (Extend Existing)

**Fields:**
- `id` (string) - Auto-generated
- `name` (string) - User's full name
- `email` (string) - User's email address
- `role` (enum) - User role: `admin`, `hr`, `employee`
- `created` (datetime) - Auto-generated
- `updated` (datetime) - Auto-generated

**Rules:**
- `name`: Required, max length 100
- `email`: Required, unique, valid email format
- `role`: Required, one of: admin, hr, employee

### 2. `events` Collection (New)

**Fields:**
- `id` (string) - Auto-generated
- `title` (string) - Company name or event title
- `description` (text) - Event description/details
- `start_datetime` (datetime) - Event start date and time
- `end_datetime` (datetime) - Event end date and time
- `assigned_to` (relation) - Multiple users (employees assigned to event)
- `created_by` (relation) - Single user (who created the event)
- `type` (enum) - Event type: `audit`, `internal_audit`, `training`, `customer_visit`, `to_be_confirmed`
- `status` (enum) - Event status: `scheduled`, `completed`, `cancelled`
- `created` (datetime) - Auto-generated
- `updated` (datetime) - Auto-generated

**Rules:**
- `title`: Required, max length 200
- `start_datetime`: Required, must be valid datetime
- `end_datetime`: Required, must be valid datetime, must be after start_datetime
- `assigned_to`: Required, must have at least one user
- `created_by`: Required, must be valid user ID
- `type`: Required, one of: audit, internal_audit, training, customer_visit, to_be_confirmed
- `status`: Required, one of: scheduled, completed, cancelled

**Relations:**
- `assigned_to` → `users` (many-to-many)
- `created_by` → `users` (one-to-one)

## Access Control Rules

### `users` Collection
- **Public**: No access
- **Authenticated**: Read own record only
- **Admin**: Full CRUD access
- **HR**: Read access to all users
- **Employee**: Read access to all users

### `events` Collection
- **Public**: No access
- **Admin**: Full CRUD access to all events
- **HR**: 
  - Create: Yes
  - Read: Events they created OR events they're assigned to
  - Update: Only events they created
  - Delete: Only events they created
- **Employee**: 
  - Create: No
  - Read: Only events they're assigned to
  - Update: No
  - Delete: No

## Sample Data

### Users
```json
{
  "name": "Pranit Sharma",
  "email": "pranit@ajasservices.com",
  "role": "employee"
}
```

### Events
```json
{
  "title": "SFP Foods",
  "description": "Quality audit for SFP Foods facility",
  "start_datetime": "2025-07-01T09:00:00.000Z",
  "end_datetime": "2025-07-01T17:00:00.000Z",
  "assigned_to": ["user_id_1", "user_id_2"],
  "created_by": "admin_user_id",
  "type": "audit",
  "status": "scheduled"
}
```

## Implementation Notes

1. **Role-Based Filtering**: The scheduler module implements role-based filtering at the application level using PocketBase queries.

2. **Multi-User Assignment**: Events can be assigned to multiple employees using the `assigned_to` relation field.

3. **Audit Trail**: The `created_by` field tracks who created each event for permission checking.

4. **Date Range Queries**: The module uses date range filters to fetch events for specific months.

5. **Real-time Updates**: PocketBase's real-time subscriptions can be used for live updates (optional enhancement).

## Setup Instructions

1. Create the `events` collection in PocketBase admin panel
2. Add the required fields with proper types and validation rules
3. Set up the relations between `users` and `events` collections
4. Configure access control rules for each collection
5. Add sample data for testing
6. Update existing users to include the `role` field

## Testing

Test the following scenarios:
- Admin can create, edit, delete any event
- HR can create events and edit only their own
- Employees can only view events assigned to them
- Role-based filtering works correctly
- Date range queries return expected results
- Multi-user assignment functions properly
