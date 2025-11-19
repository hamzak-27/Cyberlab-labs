# Cyber Security Website Architecture

## Overview

This document outlines the architecture of the Cyber Security website, which is built using React and follows a component-based structure. The website consists of a landing page with multiple sections and a dashboard page inspired by the Hack The Box Academy.

## Component Structure

```
App
├── Router
│   ├── Route: Home Page
│   │   ├── Hero
│   │   ├── Home_page
│   │   ├── BenefitsSection
│   │   ├── VideoSection
│   │   ├── CounterSection
│   │   ├── CaseStudiesSection
│   │   └── ReviewSection
│   └── Route: Dashboard
│       └── Dashboard
│           ├── Sidebar
│           │   ├── Logo
│           │   ├── Navigation Sections
│           │   └── Navigation Links
│           └── Dashboard Main
│               ├── Top Bar
│               │   ├── Search
│               │   └── User Profile
│               ├── Progress Section
│               │   ├── Offensive Circle
│               │   ├── Defensive Circle
│               │   └── General Circle
│               ├── Modules Section
│               │   └── Module Table
│               └── Side Panels
│                   ├── Streak Panel
│                   ├── Referral Panel
│                   └── Additional Panels
```

## Navigation Flow

```
Landing Page ⟷ Dashboard Page
     │             │
     v             v
Individual     Dashboard
 Sections      Components
```

- Users can navigate between the landing page and dashboard using links/buttons
- The Hero component on the landing page contains a link to the Dashboard
- The Dashboard sidebar contains a link back to the Home page

## Styling Structure

```
styles/
├── App.css          # Global styles
├── home_page.css    # Styles for landing page sections
├── Dashboard.css    # Styles for dashboard layout and components
└── Component-specific CSS files
```

## Color Theme

The website uses a custom dark theme inspired by Hack The Box Academy:

- Primary background: #0c1624 (Dark blue)
- Secondary background: #12192a (Slightly lighter blue)
- Accent color: #9ae62e (Bright green)
- Text colors:
  - Primary text: #ffffff (White)
  - Secondary text: rgba(255, 255, 255, 0.7) (Semi-transparent white)
  - Muted text: #6c7988 (Gray blue)
- Additional accent colors:
  - Offensive: #ff5a5a (Red)
  - Defensive: #5a9fff (Blue)
  - Action button: #0d84f5 (Bright blue)

## Component Responsibilities

### App Component
- Manages routing between pages
- Renders the appropriate components based on the current route

### Landing Page Components
- **Hero**: Main banner with call-to-action and navigation
- **Home_page**: Introduction to the website's services
- **BenefitsSection**: Highlights benefits of the cyber security services
- **VideoSection**: Displays promotional or educational video
- **CounterSection**: Shows statistics and achievements
- **CaseStudiesSection**: Showcases success stories and case studies
- **ReviewSection**: Displays testimonials and reviews

### Dashboard Components
- **Dashboard**: Main container for the dashboard page
  - **Sidebar**: Navigation menu for the dashboard
  - **Top Bar**: Search and user profile
  - **Progress Section**: Visual progress tracking
  - **Modules Section**: Available training modules
  - **Side Panels**: Additional information and features

## State Management

- Currently using React's built-in state management
- Navigation state handled by React Router
- Component-specific state for UI interactions

## Future Enhancements

- User authentication and profile management
- Dynamic module content loading
- Progress tracking and persistence
- Advanced search functionality
- Interactive learning paths
- Responsive design improvements for mobile devices