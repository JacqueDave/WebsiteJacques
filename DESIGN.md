# Design System: Leverage in the Game
**Project ID:** stitch_leverage_in_the_game_basketball_coaching_website

## 1. Visual Theme & Atmosphere
The design atmosphere is intensely cinematic, premium, and inherently athletic. It utilizes a dark mode philosophy ("background-dark") combined with subtle neon accents and glassmorphism to create a high-performance, focused environment. The overall vibe is serious, modern, and high-ROI, reflecting professional sports environments—heavy use of deep, shadowy depths punctuated by sharp, vibrant highlights to guide the user's eye toward calls to action. The UI employs subtle depth via faint grid-patterns and blurred glowing orbs in the background.

## 2. Color Palette & Roles
* **Neon Lime-Green (#b7d959)** - Primary. Used for the main call-to-action buttons, key highlighted text ("Make Yourself Useful"), icons, glowing blurred orbs, and indicating selection states. It acts as the high-energy focal point.
* **Warm Muted Gold (#f0c27b)** - Accent. Used subtly to draw attention to "Best Value" badges, specific "Core Advantage" labels, and secondary highlights. It provides a premium, championship-tier feel.
* **Deep Space Black (#0b0d10)** - Background Dark. Used as the absolute lowest layer of the page, acting as the void that pushes everything else forward. Applies to the main `<body>`.
* **Charcoal Slate (#16181d)** - Surface Dark. Used for elevated cards, secondary sections, and structural elements differentiating from the absolute black background.
* **Off-White/Ghost (#f7f8f6)** - Background Light. (Reserved for potential light-mode transitions or extreme highlights, though the primary theme is aggressively dark).
* **Muted Slate Text (e.g. text-slate-400)** - Used for body copy and descriptive text, reducing eye strain and keeping the focus on neon highlights and headers.

## 3. Typography Rules
* **Headers & Displays:** **Oswald** (sans-serif). Driven heavily by uppercase styling (`uppercase`), aggressive tracking (`tracking-tighter` or `tracking-widest` for small labels), and heavy weights (`font-black`, `font-bold`). It dictates the strong, unyielding structure of the page.
* **Body & Legibility:** **Lexend** (sans-serif). Used for longer paragraphs, reading material, and normal weights (`font-light`, `text-sm`). It provides highly legible, rounded counter-balance to the sharp headers.

## 4. Component Stylings
* **Buttons:** Gently rounded corners (`rounded-lg`), filled solidly with Primary (#b7d959) featuring absolute dark text (#0b0d10) for maximum contrast. They utilize uppercase, bold, and tracked-out (`tracking-widest`) text. They have hover transformations (`hover:bg-white transition-all active:scale-95`).
* **Cards/Containers:** Glassmorphic (`glass` class), using extremely subtle white backgrounds (`rgba(255, 255, 255, 0.03)`), backdrop blurs, and whisper-thin white borders (`border-white/5` or `border-white/10`). Corners are generously rounded (`rounded-2xl`). Sometimes supported by soft glowing drop shadows (`shadow-primary/20`).
* **Inputs/Forms:** Deep dark fields (`bg-background-dark` or `bg-white/5`), surrounded by thin white borders (`border-white/10`). Uses a focus ring in the primary color (`focus:ring-primary focus:border-primary`).
* **Badges/Labels:** Minimalist tags using low-opacity backgrounds (e.g., `bg-primary/10`) with thin matching borders (`border-primary/20`), containing tiny (`text-[10px]`), heavily tracked, uppercase bold text.

## 5. Layout Principles
* **Structure:** Centered, column-based flows wrapped in `max-w-7xl` or `max-w-md` containers for focused reading.
* **Spacing:** Generous padding (`py-20`, `py-24`) separates distinct ideas, giving the dense content room to breathe. The layout is structured but occasionally breaks the grid playfully using slight rotations (`rotate-2`) or overlapping absolute positioning (glowing orbs behind cards).
* **Responsiveness:** Switches from single-column masonry and stacked cards on mobile to 2, 3, or 4-column grids (`md:grid-cols-2`, `lg:grid-cols-4`) on larger screens. Navigations drop their inline links on mobile.
