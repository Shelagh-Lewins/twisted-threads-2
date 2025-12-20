# Twisted Threads 2 - Project Summary

**Last Updated:** December 19, 2025

## Overview

Twisted Threads 2 is a web application for tablet weaving built with Meteor, React, and Redux. It allows users to create, edit, and share weaving patterns for tablet weaving, a technique used to create decorative bands of fabric.

**Repository:** https://github.com/Shelagh-Lewins/twisted-threads-2

**Version:** 2.2.5

## Current Migration Status

### Meteor Upgrade: 2.9 → 3.3.2

**Status:** App is running but migration not complete

**Completed:**

- Core app functionality restored
- React 18 integration
- MongoDB driver updated

**Pending Migrations:**

1. **Search functionality** - Server publications need full migration
2. **Roles system** - Migrating from `alanning:roles` to core `meteor/roles`
   - One-time database migration required for roles data structure
3. **Router** - React Router integration needs review
4. **Environment variables** - Slingshot and other modules need proper handling

## Technology Stack

### Core Framework

- **Meteor:** 3.3.2 (upgraded from 2.9)
- **Node.js:** Compatible with Meteor 3.3.2
- **MongoDB:** Primary database

### Frontend

- **React:** 18.3.1 (upgraded from earlier version)
- **React DOM:** 18.3.1
- **Redux:** 5.0.1 (state management)
- **React-Redux:** 9.2.0
- **Redux Thunk:** 3.1.0 (async actions)
- **React Router:** 5.3.4
- **React Router DOM:** 5.3.4

### UI Components & Styling

- **Bootstrap:** 5.3.3
- **Reactstrap:** 9.2.3
- **SCSS:** Styling system
- **React Widgets:** 4.6.1
- **React Color:** 2.19.3 (color picker)
- **FontAwesome:** 6.7.2 (icons)

### Forms & Validation

- **Formik:** 2.4.6 (form management)
- **SimpleSchema:** 1.13.1 (data validation)
- **Collection2:** 4.1.4 (schema validation for collections)

### File Uploads

- **Slingshot:** 0.7.1 (AWS S3 uploads)
- **AWS SDK:** 2.1692.0
- **React Dropzone:** 14.3.5

### Image Processing

- **Jimp:** 0.9.8 (server-side image manipulation)
- **save-svg-as-png:** 1.4.17

### Utilities

- **Moment.js:** 2.30.1 (date handling)
- **jQuery:** 3.7.1
- **DOMPurify:** 3.2.3 (XSS protection)
- **Updeep:** 1.2.4 (immutable updates)
- **Reselect:** 5.1.1 (Redux selectors)
- **Re-reselect:** 5.1.0 (memoized selectors)

### Testing

- **Mocha:** 8.2.0 (test framework)
- **Chai:** 5.1.2 (assertions)
- **Sinon:** 19.0.2 (mocking)
- **Puppeteer:** 23.11.1 (E2E testing)

### Development Tools

- **ESLint:** 9.17.0
- **Prettier:** (code formatting)
- **TypeScript ESLint:** 8.19.0
- **Sass Lint:** 1.13.1

## Project Structure

### Root Level

```
/client/              # Client-side entry point
/server/              # Server-side entry point
/imports/             # Shared code (Meteor convention)
/public/              # Static assets
/test/                # Application tests
/.meteor/             # Meteor configuration
```

### Client (`/client/`)

- `index.html` - HTML template
- `main.js` - Client entry point with React root rendering
- `style.css` - Global styles

### Imports (`/imports/`)

Main application code organized by client/server:

**`/imports/client/`**

- `components/` - React components (presentational)
- `containers/` - React containers (connected to Redux)
- `forms/` - Form components with Formik
- `constants/` - Client-side constants
- `modules/` - Client utilities (store, reducers, actions)

**`/imports/modules/`** (Shared)

- `collection.js` - MongoDB collections definition
- `parameters.js` - Shared configuration and constants
- `permissionQueries.js` - Permission logic for collections
- `schemas/` - SimpleSchema definitions for all collections

**`/imports/server/`**

- `modules/` - Server-side logic (publications, slingshot config)
- `searchPublications.js` - Search functionality

### Server (`/server/`)

- `main.js` - Server entry point
- `methods/` - Meteor methods (API endpoints)
  - `auth.js` - Authentication
  - `colorBook.js` - Color book operations
  - `pattern.js` - Pattern CRUD
  - `patternEdit.js` - Pattern editing
  - `patternImages.js` - Image handling
  - `patternPreview.js` - Preview generation
  - `set.js` - Pattern sets
  - `tags.js` - Tag management
  - `migrations.js` - Database migrations
- `test/` - Server-side tests

## Database Collections

### Main Collections

1. **Patterns** (`patterns`)
   - Core pattern data for tablet weaving
   - Schema: `patternsSchema.js`
   - Auto-timestamps: `createdAt`, `modifiedAt`

2. **ColorBooks** (`colorBooks`)
   - User-defined color palettes
   - Schema: `colorBooksSchema.js`

3. **PatternPreviews** (`patternPreviews`)
   - Generated preview images/data
   - Schema: `patternPreviewsSchema.js`

4. **PatternImages** (`patternImages`)
   - User-uploaded images for patterns
   - Schema: `patternImagesSchema.js`

5. **Sets** (`sets`)
   - Collections of patterns
   - Schema: `setsSchema.js`
   - Auto-timestamps: `createdAt`, `modifiedAt`

6. **Tags** (`tags`)
   - Pattern tagging system
   - Schema: `tagsSchema.js`

7. **FAQ** (`faq`)
   - Frequently asked questions
   - Schema: `faqSchema.js`

8. **ActionsLog** (`actionsLog`)
   - Server-only throttling log
   - Schema: `actionsLogSchema.js`

9. **Users** (Meteor.users)
   - User accounts (built-in Meteor collection)
   - Extended with custom fields

### Search Implementation

Search is handled via server publications in `/imports/server/searchPublications.js`:

- `search.patterns` - Pattern search
- `search.users` - User search
- `search.sets` - Set search

**Note:** Search implementation needs migration for Meteor 3.3.2 compatibility.

## User Roles & Permissions

### Role System

Defined in `/imports/modules/parameters.js` as `ROLES`:

1. **registered** - Basic registered user
2. **verified** - Email verified user
3. **premium** - Paid/premium user
4. **administrator** - Admin access, can manage roles
5. **serviceUser** - Special system user for automated tasks (e.g., preview generation)

### Role Limits

`ROLE_LIMITS` object defines storage/resource quotas per role.

### Migration Note

Currently migrating from `alanning:roles` package to core `meteor/roles`:

- Server code updated to use async role APIs (`createRoleAsync`)
- Database migration script needed (one-time operation)
- Check all role-related queries and method calls

## Authentication

**Email/Password** authentication via Meteor Accounts:

- Email verification required for full access
- Password reset functionality
- Custom email templates configured in `server/main.js`

**Email Templates:**

- Verify Email
- Reset Password
- Custom branding: "Twisted Threads"

## Key Features

### Pattern Types

Defined in `ALLOWED_PATTERN_TYPES`:

- **Individual** - Simulation pattern, tablets turned individually
- Support for 2, 4, or 6 holes per tablet

### Pattern Capabilities

- Max rows: 200 (`MAX_ROWS`)
- Max tablets: 100 (`MAX_TABLETS`)
- Freehand chart editing
- Color book integration
- Pattern preview generation
- Image uploads (via Slingshot/S3)
- Pattern sets/collections
- Tagging system

### Weaving Instructions

- Interactive weaving chart
- Print view functionality
- Threading diagrams
- Various weaving modes (all-together, individual)

## File Uploads (Slingshot)

**AWS S3 Integration** for pattern images:

- Package: `edgee:slingshot@0.7.1`
- Configuration: `/imports/server/modules/slingshot.js`

**Required Environment Variables:**

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_BUCKET
AWSRegion (optional)
```

**Restrictions:**

- Max file size: 2MB
- Allowed types: PNG, JPEG, GIF
- Requires verified email

**Migration Note:** Slingshot setup now checks for environment variables at startup and gracefully handles missing credentials to avoid crashes in development.

## Environment Configuration

### Environment Variables

Managed via `.env` file (not committed):

- `MAIL_URL` - Email service configuration
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_BUCKET` - S3 bucket name
- `AWSRegion` - AWS region (optional)

### Startup Script

Use `./run_meteor.sh` to:

1. Load environment variables from `.env`
2. Start Meteor with proper configuration

## Routing

**React Router** integration:

- Router setup: `/imports/client/containers/App.js`
- Routes defined for all main views
- Uses `react-router-dom` v5
- Mix of old (`react-router`) and new (`react-router-dom`) imports

**Main Routes:**

- Home
- Pattern (view/edit)
- Print View
- Pattern Sets
- Color Books
- User Profiles
- Account Management
- About/FAQ

**Migration Note:** Router needs review for Meteor 3.3.2 compatibility and consistency.

## State Management (Redux)

**Store Configuration:** `/imports/client/modules/store.js`

**Redux DevTools** integration (development only)

**Provider Setup:**

- Redux Provider wraps entire app
- Custom `DatabaseProvider` for Meteor data integration
- `AppContext` for sharing database subscriptions

**State Structure:**

- Pattern data
- Color books
- User data
- UI state
- Form state (via Formik)

## Testing

### Test Scripts

```bash
# Server tests (watch mode)
./test_meteor.sh

# Full app tests
npm run test-app
```

### Test Organization

**Server Tests** (`/server/test/`):

- 01 - Publications
- 02 - Pattern methods
- 02a - Pattern edit methods
- 03 - Auth methods
- 04 - Color book methods
- 05 - Pattern preview methods
- 06 - Tags methods
- 07 - Sets methods
- 09 - Indexes
- 10 - Slingshot
- 11 - Index creation

**Schema Tests** (`/test/`):

- 08 - Schema validation

**Test Utilities:**

- `mockUser.js` - User mocking
- `testData.js` - Test data generation
- `createManyPatterns.js` - Bulk pattern creation

## Deployment

### Deploy Scripts

- `testserver_deploy.sh` - Test server deployment
- `unicorn2022_deploy.sh` - Production deployment

### Database Indexes

**Automatic Index Creation:**
MongoDB indexes are created automatically at server startup (`server/main.js`).

**Note:** Database user must have index creation privileges. If privileges are insufficient, index creation will fail with logged errors.

## Development Workflow

### Package Management

**IMPORTANT:** Always use `meteor npm` instead of plain `npm` when installing packages.

```bash
# Install a new package
meteor npm install package-name

# Install a specific version
meteor npm install package-name@version

# Install dev dependencies
meteor npm install --save-dev package-name
```

**Why `meteor npm`?**

- Ensures you're using the Node.js version bundled with Meteor
- Critical for compatibility with Meteor 3.3.2
- Prevents version conflicts and build issues
- Especially important for packages that depend on Node.js features

### Start Development Server

```bash
meteor
# OR with environment variables:
./run_meteor.sh
```

### Run Tests

```bash
./test_meteor.sh
```

### Code Style

- ESLint configured
- Prettier integration
- React/JSX linting
- Import/module resolution

## Known Issues & TODOs (Meteor 3.3.2 Migration)

### High Priority

1. ✅ **Core app running** - Basic functionality restored
2. 🔄 **Search migration** - Complete search publication migration
3. 🔄 **Roles migration** - Complete migration to `meteor/roles`
   - Update all role queries to async APIs
   - Database migration script for role data structure
4. 🔄 **Router review** - Ensure React Router fully compatible
5. 🔄 **Environment variables** - Verify all modules handle missing env vars gracefully

### Testing Required

- Full test suite pass after migrations
- Role permission checks
- Search functionality
- File upload with Slingshot
- All CRUD operations

## Architecture Patterns

### Meteor Patterns

- Method calls for mutations
- Publications for subscriptions
- Server-side only sensitive operations
- Optimistic UI updates via Redux

### React Patterns

- Container/Component separation
- HOCs for routing (`withRouter`)
- Redux connect HOCs
- Formik for form management
- Context API for database provider

### Data Flow

1. User interaction → Component
2. Component dispatches Redux action
3. Action calls Meteor method
4. Server processes and updates DB
5. Publication sends updated data
6. Redux store updated via subscription
7. Components re-render via React-Redux

## Important Constants

**Pattern Limits:**

- `MAX_ROWS`: 200
- `MAX_TABLETS`: 100
- `ALLOWED_HOLES`: [2, 4, 6]
- `DEFAULT_HOLES`: 4

**Pagination:**

- `ALLOWED_ITEMS_PER_PAGE`: [10, 15, 20, 25, 30, 35, 40]

**Default Colors:**

- `DEFAULT_PALETTE`: 16 colors for patterns
- `DEFAULT_WEAVING_BACKWARDS_BACKGROUND_COLOR`: '#aaa'

## Helpful Files to Reference

When working on specific features, these files are most helpful:

**General Structure:**

- `/imports/modules/parameters.js` - All constants
- `/imports/modules/collection.js` - Collection definitions
- `/imports/client/containers/App.js` - Routing and app structure

**State Management:**

- `/imports/client/modules/store.js` - Redux store setup

**Server API:**

- `/server/methods/` - All Meteor methods
- `/imports/server/modules/publications.js` - Data publications

**Schemas:**

- `/imports/modules/schemas/` - All collection schemas

## Daily Development Checklist

When starting work:

1. Check current migration status in this document
2. Review any pending TODOs related to your work
3. Ensure environment variables are set (if needed)
4. Run tests related to your changes
5. Check for console errors after changes

## Additional Notes

- **Tablet Weaving Context:** This app is domain-specific for tablet weaving, a historical textile technique. Understanding pattern terminology may require domain knowledge.
- **AWS Dependency:** Full functionality requires AWS S3 configuration, but app runs without it.
- **Email Dependency:** Email verification requires MAIL_URL configuration.
