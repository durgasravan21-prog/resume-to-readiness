---
name: Warm Editorial Advisory
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#43474e'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f86'
  primary: '#032448'
  on-primary: '#ffffff'
  primary-container: '#1f3a5f'
  on-primary-container: '#8ba4cf'
  inverse-primary: '#aec8f4'
  secondary: '#9c431e'
  on-secondary: '#ffffff'
  secondary-container: '#fd8d61'
  on-secondary-container: '#732601'
  tertiary: '#1e2430'
  on-tertiary: '#ffffff'
  tertiary-container: '#343a47'
  on-tertiary-container: '#9ea3b3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#aec8f4'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2d476d'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#380d00'
  on-secondary-fixed-variant: '#7d2d07'
  tertiary-fixed: '#dde2f3'
  tertiary-fixed-dim: '#c1c6d6'
  on-tertiary-fixed: '#161c27'
  on-tertiary-fixed-variant: '#414754'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display:
    fontFamily: Source Serif 4
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Source Serif 4
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Public Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Public Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  code-data:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system embodies the presence of an unhurried, deeply credible counselor. It rejects modern AI clichés—there are no neon accents, ambient glows, chromatic gradients, floating glass panels, or synthetic sparkle/robot motifs. The visual identity instead evokes the physical tactile warmth of fine archival paper, thoughtful margin annotations, and classical academic institutional rigor.

The user experience prioritizes emotional security and mental clarity. Students and career switchers assessing qualifications often experience acute anxiety; the interface counters this by presenting objective, analytical feedback with warmth, calm structure, and quiet authority. The visual design is flat, low-saturation, structured, and editorial.

## Colors

The palette draws directly from classic editorial printing and archival bookbinding:

- **Background Canvas (`#FAF7F2`)**: Warm paper base tone that softens high-contrast eyestrain and grounds the reading experience.
- **Card & Workspace Surface (`#FFFFFF`)**: Pure parchment white applied exclusively to interactable cards, form fields, and modal containers, bordered cleanly against the canvas.
- **Primary Text / Ink (`#1E2330`)**: Deep graphite ink, providing crisp legibility while avoiding the harshness of pure black.
- **Secondary Text (`#5E6472`)**: Slate gray for metadata, supportive analytical descriptions, and structural field labeling.
- **Primary Brand / Action (`#1F3A5F`)**: Deep academic navy conveying institutional trustworthiness. Hover state transitions cleanly to `#172D4A`.
- **Accent (`#C8643C`)**: Natural terracotta, reserved for milestones, strategic callouts, and critical inflection points.
- **Diagnostic Tiers**:
  - *Strong Evidence*: Text `#4F7A5A`, Surface `#E8F0EA` (Muted Sage)
  - *Needs Proof*: Text `#B7832F`, Surface `#F7EEDB` (Warm Amber Ochre)
  - *Missing Skill*: Text `#A6483A`, Surface `#F6E4E0` (Subdued Terra Rust)
- **Structural Boundary**: `#E6E0D5` delivers a consistent 1px delineation across surfaces, dividing lines, and tabular borders.

## Typography

The typography system pairs the intellectual rigor of a traditional serif with an accessible, high-clarity grotesque sans and a structural monospaced utility font:

- **Source Serif 4 (Semibold)**: Used for all main section titles, gap diagnosis headers, and report summaries. Conveys editorial integrity, literature, and calm advisement.
- **Public Sans (Regular & Semibold)**: Used for interactive controls, explanatory body copy, comparison descriptions, and system instructions. Selected for neutral clarity and exceptional legibility across dense information structures.
- **IBM Plex Mono (Medium)**: Used strictly for quantitative metrics, match percentages, skill count indicators, technical tags, and parsed document fragments.

All headline sizes strictly scale down below 768px viewports to preserve editorial balance without awkward line breaks.

## Layout & Spacing

The layout is grounded in a disciplined 8px base rhythm. Layouts rely on a max-width container of 1200px to maintain comfortable reading widths for long-form skill analyses and side-by-side comparative views (Resume vs. Target Role).

- **Desktop (1024px+)**: 12-column layout with 24px gutters and 48px outer canvas margins. Side-by-side gap analysis splits evenly into 6-column panes or an asymmetrical 7:5 ratio for primary roadmap view vs. evidence ledger.
- **Tablet (768px - 1023px)**: 8-column layout with 20px gutters and 32px canvas margins. Comparison views switch to tabbed navigation or stacked sequential modules.
- **Mobile (< 768px)**: 4-column layout with 16px gutters and 20px margins. Comparative sections stack vertically; touch elements conform to the minimum 44px tap target standard.

## Elevation & Depth

This system avoids ambient drop shadows, blurred depth maps, and skeuomorphic bevels. Visual hierarchy is established exclusively through surface separation and flat, crisp perimeter borders:

- **Base Elevation (Canvas)**: Background `#FAF7F2` sits behind all containers.
- **Card & Panel Layer**: Set to `#FFFFFF` flat surface with a mandatory `1px solid #E6E0D5` stroke.
- **Hover & Active States**: Interactive cards use a border tint shift to `#1F3A5F` or `#5E6472` rather than floating shadows or vertical translations.
- **Modals and Overlays**: Modals rest on a `#1E2330` backdrop with 32% opacity (non-blurred). The modal card maintains `#FFFFFF` surface fill with an `E6E0D5` border.
- **Dividers & Structural Rules**: Subtle structural divisions utilize `1px solid #E6E0D5` hairpins to delineate subsections without visual clutter.

## Shapes

The geometric identity relies on controlled, modest corner radii that evoke tailored stationary and modular library card catalogs:

- **Cards & Data Modules**: Fixed `10px` corner radius.
- **Buttons, Form Inputs & Select Controls**: Fixed `8px` corner radius.
- **Status Badges, Skill Tags & Micro Indicators**: Full pill radius (`9999px`) to visually separate continuous categorization from interactive block elements.
- **Iconography**: Clean 1.5px stroke weight, 20px or 24px bounding box, unclosed lines with rounded joins. No filled icon variants.

## Components

### Buttons & Interactive Controls
- **Primary Button**: Background `#1F3A5F`, text `#FFFFFF`, 8px corner radius. Padding: 12px 20px (minimum height 44px). Hover state: `#172D4A`. Focus: 2px offset ring in `#1F3A5F`.
- **Secondary Button**: Background `#FFFFFF`, text `#1F3A5F`, border `1px solid #E6E0D5`, 8px corner radius. Hover: background `#FAF7F2`, border `#1F3A5F`.
- **Tertiary / Ghost Button**: Background transparent, text `#1F3A5F`, underline on hover, 44px minimum tap target.

### Status Badges & Skill Evidence Chips
- **Diagnostic Tags**: Full pill geometry (`rounded-full`), padding 4px 10px, typography `IBM Plex Mono` 12px / semibold.
  - *Strong Evidence*: `#4F7A5A` on `#E8F0EA`.
  - *Needs Proof*: `#B7832F` on `#F7EEDB`.
  - *Missing*: `#A6483A` on `#F6E4E0`.
- **Categorical Skill Tag**: Neutral pill `#FFFFFF`, border `1px solid #E6E0D5`, text `#5E6472`.

### Inputs & Text Areas
- **Form Controls**: Background `#FFFFFF`, border `1px solid #E6E0D5`, 8px corner radius. Text `#1E2330`, placeholder `#5E6472`. Height 44px, padding 0 14px. Focus state: border `1px solid #1F3A5F`, no outer glow.

### Cards & Split-Screen Comparison Panes
- **Resume & Job Match Panels**: Background `#FFFFFF`, border `1px solid #E6E0D5`, 10px corner radius. Internal padding 24px (desktop) or 16px (mobile). Subdivided by hairline `1px solid #E6E0D5` horizontal dividers.

### Checkboxes & Selection Indicators
- **Control Box**: 20px by 20px square with a 4px corner radius and `1px solid #E6E0D5` border. Checked state: `#1F3A5F` background with a white 1.5px line checkmark.

### Prioritized Roadmap Step Card
- **Milestone Item**: Flat white surface, 10px radius, 1px `#E6E0D5` border. Left-aligned priority rank in `IBM Plex Mono` with accent color `#C8643C`. Timeline indicators connect via subtle 1.5px vertical rules in `#E6E0D5`.