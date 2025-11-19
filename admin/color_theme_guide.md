# Cyber Security Website - Color Theme Guide

## Overview

This document describes the color theme for the Cyber Security website, inspired by Hack The Box Academy but with custom colors. This guide ensures consistent use of colors across all components and pages of the website.

## Primary Colors

| Color Name     | Hex Code | Usage                                         |
| -------------- | -------- | --------------------------------------------- |
| Background     | #0a101d  | Main background color for all pages           |
| Sidebar        | #111927  | Sidebar background and secondary elements     |
| Accent Green   | #9ae62e  | Primary accent color, CTAs, active items      |
| Offensive Red  | #ff5a5a  | Offensive security elements, warnings, errors |
| Defensive Blue | #5a9fff  | Defensive security elements, information      |
| Action Blue    | #0d84f5  | Buttons, interactive elements                 |

## Text Colors

| Color Name     | Hex Code                 | Usage                           |
| -------------- | ------------------------ | ------------------------------- |
| Primary Text   | #ffffff                  | Main text, headings             |
| Secondary Text | rgba(255, 255, 255, 0.7) | Subheadings, descriptions       |
| Muted Text     | #6c7988                  | Labels, captions, inactive text |
| Accent Text    | #9ae62e                  | Highlighted text, active items  |

## UI Element Colors

| Element Type         | Background Color          | Border Color              | Text Color               |
| -------------------- | ------------------------- | ------------------------- | ------------------------ |
| Panels               | rgba(20, 30, 50, 0.4)     | rgba(255, 255, 255, 0.05) | #ffffff                  |
| Tables               | rgba(20, 30, 50, 0.4)     | rgba(255, 255, 255, 0.05) | #ffffff                  |
| Table Headers        | rgba(0, 0, 0, 0.2)        | -                         | rgba(255, 255, 255, 0.7) |
| Primary Buttons      | #0d84f5                   | none                      | #ffffff                  |
| Secondary Buttons    | rgba(255, 255, 255, 0.05) | rgba(255, 255, 255, 0.1)  | #ffffff                  |
| Accent Buttons       | rgba(154, 230, 46, 0.15)  | rgba(154, 230, 46, 0.3)   | #9ae62e                  |
| Search/Input Fields  | rgba(255, 255, 255, 0.05) | none                      | #ffffff                  |
| Badges - Fundamental | rgba(154, 230, 46, 0.15)  | none                      | #9ae62e                  |
| Badges - New         | #9ae62e                   | none                      | #0c1624                  |

## Hover States

| Element         | Background Change        | Other Effects                                    |
| --------------- | ------------------------ | ------------------------------------------------ |
| Sidebar Items   | none                     | Color: #fff (from #aeb8c5)                       |
| Primary Buttons | #1a90ff (from #0d84f5)   | Transform: translateY(-1px), Box-shadow          |
| Accent Buttons  | rgba(154, 230, 46, 0.25) | Transform: translateY(-1px), Box-shadow          |
| Panels          | none                     | Transform: translateY(-2px), Enhanced box-shadow |

## Shadow Effects

| Element          | Shadow Style                                                               |
| ---------------- | -------------------------------------------------------------------------- |
| Sidebar          | box-shadow: 0 0 20px rgba(0, 0, 0, 0.4)                                    |
| Panels/Modules   | box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)                                  |
| Buttons (hover)  | box-shadow: 0 2px 8px rgba(13, 132, 245, 0.4) (color varies)               |
| Progress Circles | box-shadow: 0 0 15px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.2) |

## Usage Guidelines

1. **Consistency**: Use these colors consistently across the entire website to maintain visual coherence.

2. **Accessibility**: Ensure sufficient contrast between text and background colors for readability.

3. **Semantic Use**:

   - Use Offensive Red for offensive security related content
   - Use Defensive Blue for defensive security related content
   - Use Accent Green for general highlights and active states

4. **Interactive Elements**:

   - All interactive elements should have hover states
   - Primary actions should use Action Blue
   - Secondary actions should use Secondary Button styles

5. **Dark Theme Emphasis**:

   - Maintain the dark theme throughout the application
   - Use lighter colors sparingly to create hierarchy and focus

6. **Gradients**: When using gradients, transition between colors within the same family (e.g., from dark blue to slightly lighter blue)
