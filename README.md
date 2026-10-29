# 🏠 RentHub — Apartment Rental Platform

RentHub is an apartment rental web application built using Angular and Tailwind CSS. It provides a platform where tenants can browse rental properties, save favourites, and send inquiries. Landlords can manage their property listings, while administrators manage user accounts, review landlord promotion requests, and oversee property listings.

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Technology Stack](#-technology-stack)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Landlord Promotion Workflow](#-landlord-promotion-workflow)
- [Application Routes](#-application-routes)
- [Admin Dashboard](#-admin-dashboard)
- [Property Management](#-property-management)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Running the Application](#-running-the-application)
- [Admin Credentials](#-admin-credentials)
- [Testing Checklist](#-testing-checklist)
- [Git Commands](#-git-commands)
- [Future Improvements](#-future-improvements)

## 📖 Project Overview

RentHub simplifies the rental process by connecting tenants and landlords through a single application.

### Objectives

- Build a responsive apartment rental platform.
- Provide property search, filtering, sorting, and pagination.
- Allow tenants to save favourite properties and send inquiries.
- Enable landlords to create and manage property listings.
- Implement an admin-controlled landlord promotion workflow.
- Provide administrative tools for managing users and property listings.
- Organize the application using Angular pages, shared components, services, models, and route guards.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Angular | Frontend framework |
| TypeScript | Application logic and type safety |
| Tailwind CSS | Responsive UI styling |
| Angular Router | Navigation and route management |
| Angular Forms | Form handling and data binding |
| Angular Pipes | Formatting dates, currency, and text |
| Git | Version control |
| GitHub | Source code hosting |

## ✨ Features

### 1. User Dashboard

The normal user dashboard allows tenants to explore rental properties.

- Browse property listings.
- Search and filter available properties.
- Sort and paginate property results where implemented.
- View detailed property information.
- Save properties to favourites.
- Send inquiries to landlords.
- Access personal profile information.
- Participate in property comments and replies where implemented.

### 2. Landlord Dashboard

The landlord dashboard provides property management features.

- Access the dashboard after landlord approval.
- Create new property listings.
- Update existing property details.
- View and manage personal listings.
- Add property images and descriptions.
- Specify rental price and location.
- Provide property details, including bedrooms and bathrooms.
- Specify furnished status and amenities.
- Configure vegetarian preference where applicable.
- Handle tenant inquiries through the available query management features.

### 3. Admin Dashboard

The admin dashboard provides administrative oversight.

- View total users, regular users, landlords, pending requests, and properties.
- Review landlord promotion requests.
- Approve or reject promotion requests.
- Search registered users by name, email, or mobile number.
- Filter users by account role.
- View user roles and promotion status.
- Search property listings by title, city, location, or landlord name.
- Browse property cards.
- Navigate through paginated user and property results.
- Select the number of records displayed per page.

### 4. Authentication and Authorization

The application includes dedicated login and registration pages, core services, and route guards.

- Register a new account.
- Log in to the application.
- Access role-specific dashboards.
- Restrict protected routes based on authentication and account role.
- Display a forbidden page when access is denied, where configured.

The exact authentication persistence mechanism depends on the implementation in the authentication service.

## 👥 User Roles

RentHub supports three account roles.

| Role | Responsibilities |
|---|---|
| User / Tenant | Browse properties, search listings, save favourites, and send inquiries. |
| Landlord | Create and manage property listings and handle tenant inquiries. |
| Admin | Manage user access, review promotion requests, and oversee property listings. |

## 🔄 Landlord Promotion Workflow

RentHub uses an admin-controlled process to promote a regular user to a landlord account.

### Workflow Steps

1. **Normal User Dashboard**  
   A registered user logs in and accesses the regular user dashboard.

2. **Request Landlord Access**  
   The user submits a request to become a landlord, optionally providing a message explaining the request.

3. **Pending Request**  
   The request is stored with a pending status.

4. **Admin Reviews the Request**  
   The administrator opens `/admin-dashboard` and reviews the applicant's information and request message.

5. **Admin Decision**  
   The administrator approves or rejects the request.

6. **Approval**  
   If approved, the user's role changes to `landlord`, enabling landlord functionality.

7. **Rejection**  
   If rejected, the request is marked as rejected and the user does not receive landlord privileges from that request.

8. **Landlord Dashboard**  
   An approved landlord can access `/landlord-dash` to manage property listings and related inquiries.

### Workflow Diagram

```text
Regular User
     |
     v
User Dashboard
     |
     v
Request Landlord Access
     |
     v
Promotion Request: Pending
     |
     v
Admin Dashboard
     |
     v
Review Promotion Request
     |
     +-------------------+
     |                   |
     v                   v
  Approve              Reject
     |                   |
     v                   v
Landlord Role        Rejected Request
     |
     v
Landlord Dashboard
     |
     v
Manage Properties
```

## 🧭 Application Routes

The following routes correspond to the pages identified in the project structure. Verify their exact URL paths in `app.routes.ts`.

| Page / Feature | Expected purpose |
|---|---|
| `/` | Home page or initial route redirect |
| `/login` | User login |
| `/register` | New account registration |
| `/user-dashboard` | Normal user dashboard |
| `/landlord-dash` | Landlord dashboard |
| `/admin-dashboard` | Admin dashboard |
| `/favourites` | Saved favourite properties |
| `/forbidden` | Access denied page |
| `/my-listings` | Manage landlord property listings |
| `/my-queries` | View user inquiries |
| `/handle-property-queries` | Manage property-related inquiries |
| `/profile` | User profile |
| `/property-details/:id` | View a property's details |
| `/property-form` | Create or edit a property |

**Note:** The route names above are based on the current application flow and page names. The actual URL paths must match the definitions in `app.routes.ts`. In particular, the landlord dashboard page folder is named `landlord-dashboard`, while the previously configured route is `/landlord-dash`.

## 🛡️ Admin Dashboard

The administrator dashboard is available at `/admin-dashboard`.

### Dashboard Statistics

The dashboard displays:

- **Total Users:** Registered non-admin accounts.
- **Regular Users:** Accounts with the regular user role.
- **Landlords:** Approved landlord accounts.
- **Pending Requests:** Promotion requests awaiting review.
- **Properties:** Total property listings.

### Landlord Promotion Requests

The administrator can review applicant details, including name, email, mobile number, promotion message, and request date.

Available actions:

- Approve Request
- Reject Request

Feedback messages communicate the result of the operation. Request buttons are disabled while processing to prevent repeated submissions.

### User Directory

The user directory supports:

- Search by full name, email, or mobile number.
- Filter by user, landlord, or admin role.
- View account role and status.
- Pagination with 3, 6, or 9 users per page.
- Previous, next, and numbered page navigation.
- A no-results message when no users match the search criteria.

### Property Directory

The property directory supports:

- Search by property title, city, location, or landlord name.
- View property images and titles.
- View monthly rental price.
- View furnished status and property location.
- View bedrooms, bathrooms, and area.
- View landlord name and listing date.
- Pagination with 3, 6, or 9 properties per page.

## 🏘️ Property Management

Property listings can include the following details, depending on the configured property model and form:

- Title and description.
- Property images.
- City and location.
- Monthly rent.
- Number of bedrooms and bathrooms.
- Area in square feet.
- Furnished status.
- Amenities.
- Rental terms.
- Landlord information.
- Vegetarian preference.
- Listing creation date.

Landlords can manage their own listings, while tenants can browse properties and use the supported favourite and inquiry functionality.

## 📁 Project Structure

The following structure reflects the folders provided for the current project.

```text
rent-hub/
├── public/
│   └── images/
│       └── properties/
├── src/
│   └── app/
│       ├── core/
│       │   ├── guards/
│       │   ├── models/
│       │   └── services/
│       │
│       ├── pages/
│       │   ├── admin-dashboard/
│       │   ├── favourites/
│       │   ├── forbidden/
│       │   ├── handle-property-queries/
│       │   ├── home-redirect/
│       │   ├── landlord-dashboard/
│       │   ├── login/
│       │   ├── my-listings/
│       │   ├── my-queries/
│       │   ├── profile/
│       │   ├── property-details/
│       │   ├── property-form/
│       │   ├── register/
│       │   └── user-dashboard/
│       │
│       └── shared/
│           └── components/
│               └── property-card/
│
├── .gitignore
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

The root files shown are the typical Angular project configuration files; retain the names that actually exist in your repository.

### Core Folder

`src/app/core/`

Contains application-wide functionality.

- **guards/** — Route guards for restricting access to protected pages.
- **models/** — TypeScript interfaces and types for users, roles, and properties.
- **services/** — Shared business logic, authentication, and property data operations.

### Pages Folder

`src/app/pages/`

Contains the application's main screens.

| Folder | Responsibility |
|---|---|
| `admin-dashboard/` | Administrative dashboard |
| `favourites/` | Favourite properties |
| `forbidden/` | Access denied screen |
| `handle-property-queries/` | Property inquiry management |
| `home-redirect/` | Initial page or redirect logic |
| `landlord-dashboard/` | Landlord dashboard |
| `login/` | Login page |
| `my-listings/` | Landlord's listings |
| `my-queries/` | User inquiries |
| `profile/` | User profile |
| `property-details/` | Property details |
| `property-form/` | Create or edit listings |
| `register/` | Registration page |
| `user-dashboard/` | Normal user dashboard |

### Shared Components

`src/app/shared/components/property-card/`

Contains the reusable property card component, which can display property information consistently wherever listings appear.

### Application Configuration

The root `src/app` directory also contains the application's routing and bootstrap configuration files, depending on the existing setup.

## 🚀 Installation and Setup

### Prerequisites

Install:

- Node.js compatible with your Angular version.
- npm.
- Git.
- Angular CLI, if you want to use the global Angular command.

Check the installed versions:

```bash
node -v
npm -v
```

### Step 1: Clone the Repository

Replace the placeholder with your actual repository URL.

```bash
git clone <YOUR_REPOSITORY_URL>
```

### Step 2: Open the Project

```bash
cd rent-hub
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

If the project has a start script configured:

```bash
npm start
```

Otherwise, use:

```bash
npx ng serve
```

### Step 5: Open RentHub

Navigate to:

`http://localhost:4200`

## 🔐 Admin Credentials

Use the admin account configured in the application's authentication service or seed data.

| Field | Value |
|---|---|
| Login page | `/login` |
| Admin email | `<YOUR_CONFIGURED_ADMIN_EMAIL>` |
| Admin password | `<YOUR_CONFIGURED_ADMIN_PASSWORD>` |
| Admin dashboard | `/admin-dashboard` |

**Important:** Replace the placeholders with your actual local test credentials if your assignment requires demo login details. The exact credentials have not been provided, so they cannot be verified here.

Avoid committing real production passwords, API keys, or other secrets to a public repository.

## 🧪 Testing Checklist

Before submitting the assignment, verify the following:

- [ ] Register a regular user.
- [ ] Log in as a regular user.
- [ ] Submit a landlord promotion request.
- [ ] Log in as an administrator.
- [ ] Approve a landlord request.
- [ ] Confirm the approved account can access the landlord dashboard.
- [ ] Reject another promotion request.
- [ ] Verify user search and role filtering.
- [ ] Verify user pagination.
- [ ] Verify property search and pagination.
- [ ] Create and update a property as a landlord.
- [ ] Verify access to property details.
- [ ] Verify favourites functionality.
- [ ] Test property inquiries and query management.
- [ ] Confirm protected routes reject unauthorized access.

## 🧑‍💻 Git Commands

Check modified files:

```bash
git status
```

Stage the README:

```bash
git add README.md
```

Commit the changes:

```bash
git commit -m "docs: update RentHub README"
```

Push your branch:

```bash
git push origin <YOUR_BRANCH_NAME>
```

## 🔮 Future Improvements

Possible future enhancements include:

- Backend API and database integration.
- Secure server-side role-based authorization.
- Cloud-based property image uploads.
- Email notifications for promotion decisions.
- Advanced property search and filtering.
- Automated unit and integration tests.
- Production deployment and monitoring.
- Improved accessibility and error handling.

## 👨‍💻 Project Information

**Project:** RentHub — Apartment Rental Platform

**Category:** Angular development assignment

**Frontend:** Angular, TypeScript, Tailwind CSS

---

Made with ❤️ for a better apartment rental experience.
