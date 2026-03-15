{
  "design_system_name": "Bitsy Admin (Sentinel Console)",
  "product_intent": {
    "app_type": "admin dashboard (platform monitoring)",
    "audience": "Bitsy platform administrators",
    "core_success_actions": [
      "See platform health in <10 seconds (KPIs + alerts)",
      "Investigate anomalies quickly (activity feed + per-hotel drilldowns)",
      "Resolve billing/commission issues (quick actions + verification)"
    ],
    "visual_personality": [
      "authoritative",
      "calm under pressure",
      "data-dense but readable",
      "enterprise ops tooling"
    ],
    "brand_constraint": "Keep Bitsy teal as brand anchor, but give Admin a darker/navy+steel identity distinct from guest/hotel portals.",
    "route_scope": "All admin pages under /admin/* should apply an Admin theme wrapper (e.g., <div data-theme=\"admin\">)."
  },
  "inspiration_refs": {
    "notes": [
      "Prefer the classic 'dark sidebar + light content' pattern for authority and scannability.",
      "Use neutral base + single accent, reserve semantic colors strictly for status.",
      "Source reference emphasizes: build gray scale first, then one accent, then semantic colors; test WCAG contrast; avoid pure black in dark mode." 
    ],
    "sources": [
      {
        "title": "AdminLTE - Best Admin Dashboard Color Schemes (2026)",
        "url": "https://adminlte.io/blog/best-admin-dashboard-color-schemes/",
        "takeaways": [
          "Dark sidebar + light content creates hierarchy",
          "Use CSS variables for theming + dark mode",
          "Semantic colors should not double as brand accent",
          "Charts need categorical/sequential/diverging strategies"
        ]
      },
      {
        "title": "Dribbble fintech dashboard tag",
        "url": "https://dribbble.com/tags/fintech-dashboard",
        "takeaways": [
          "Terminal-like density: compact table rows + sticky headers",
          "KPI bento grids with subtle borders",
          "Use monospace for IDs/hashes"
        ]
      }
    ]
  },
  "typography": {
    "fonts": {
      "heading": {
        "css_var": "--font-heading",
        "current": "Space Grotesk",
        "usage": "Page titles, section titles, KPI labels (semi-bold/bold)."
      },
      "body": {
        "css_var": "--font-body",
        "current": "Inter",
        "usage": "All body text, table text, form labels."
      },
      "mono": {
        "css_var": "--font-mono",
        "current": "Azeret Mono",
        "usage": "Booking IDs, transaction hashes, hotel IDs, numeric deltas, timestamps."
      }
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-heading tracking-tight",
      "h2": "text-base md:text-lg font-medium",
      "kpi_value": "text-2xl sm:text-3xl font-semibold tabular-nums",
      "body": "text-sm sm:text-base",
      "small": "text-xs sm:text-sm",
      "table": {
        "header": "text-xs font-medium uppercase tracking-wide",
        "cell": "text-sm leading-5"
      }
    },
    "numerical_formatting": {
      "rules": [
        "Use tabular numbers on KPI values and tables: 'tabular-nums'",
        "Use Azeret Mono for IDs and on-chain fields",
        "Use compact date format in tables (e.g., 2026-03-15 14:32) with mono"
      ]
    }
  },
  "color_system": {
    "theme_strategy": {
      "admin_theme_scope": "Add [data-theme='admin'] variables in index.css so guest/marketplace themes remain untouched.",
      "layout_pattern": "Dark sidebar + light content for default; optional full dark mode toggle later.",
      "gradient_policy": "Admin uses near-zero gradients. If needed, only a thin top glow strip in header (<20% viewport)."
    },
    "tokens_hsl": {
      "admin": {
        "--background": "210 20% 98%",
        "--foreground": "222 22% 10%",
        "--card": "0 0% 100%",
        "--card-foreground": "222 22% 10%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "222 22% 10%",

        "--primary": "171 80% 40%",
        "--primary-foreground": "0 0% 100%",

        "--secondary": "215 25% 95%",
        "--secondary-foreground": "222 16% 22%",

        "--muted": "215 25% 95%",
        "--muted-foreground": "222 10% 42%",

        "--accent": "171 65% 32%",
        "--accent-foreground": "0 0% 100%",

        "--border": "214 18% 86%",
        "--input": "214 18% 86%",
        "--ring": "171 80% 40%",

        "--destructive": "0 72% 50%",
        "--destructive-foreground": "0 0% 100%",

        "--warning": "38 92% 50%",
        "--warning-foreground": "0 0% 7%",

        "--success": "152 62% 36%",
        "--success-foreground": "0 0% 100%",

        "--admin-sidebar": "222 47% 11%",
        "--admin-sidebar-foreground": "210 25% 96%",
        "--admin-sidebar-muted": "222 35% 16%",
        "--admin-sidebar-border": "222 25% 18%",

        "--shadow-sm": "0 1px 2px rgba(2, 6, 23, 0.06)",
        "--shadow-md": "0 18px 45px rgba(2, 6, 23, 0.10)",
        "--shadow-ring": "0 0 0 4px rgba(20, 184, 166, 0.18)",
        "--noise-opacity": "0.035"
      }
    },
    "hex_quick_refs": {
      "admin_sidebar": "#0f172a",
      "admin_content_bg": "#f4f6f9",
      "teal_primary_anchor": "hsl(171, 80%, 40%)",
      "border": "#dee2e6"
    },
    "semantic_rules": [
      "Do NOT use teal for success states. Success remains green; teal is brand/action.",
      "Do NOT use color alone to convey status; always pair with icon + label + badge text.",
      "Billing states: Grace=warning(amber), Blocked=destructive(red), Active=neutral/teal accent only."
    ]
  },
  "layout_and_grid": {
    "admin_shell": {
      "pattern": "Left fixed sidebar + top command bar + scrollable content region",
      "desktop_grid": "12-col content grid; max-w: none (full-width).",
      "content_padding": "p-4 sm:p-6 lg:p-8",
      "sidebar_width": "w-[280px] (collapsed: w-[76px])",
      "topbar_height": "h-14",
      "sticky_zones": [
        "Sticky topbar (search, environment switch, admin profile)",
        "Sticky table headers (commission table, hotels table)",
        "Optional sticky right rail for alerts on wide screens"
      ]
    },
    "page_templates": {
      "dashboard_home": "Bento KPI grid (4 cards) + alerts strip + 2-column lower: activity feed (left) + billing risk list (right)",
      "commissions": "Toolbar (filters, export) + dense table + side drawer for verification details",
      "hotels": "Search + status tabs + table with row actions + bulk actions bar",
      "billing": "Segmented tabs: Grace / Blocked / All + action-centric list cards",
      "activity": "Realtime feed: timeline list with filters + auto-refresh indicator",
      "hotel_details": "Header (hotel name + status + actions) + analytics tabs (Overview/Bookings/Revenue/Payments)"
    }
  },
  "components": {
    "component_path": {
      "shadcn_primary": "/app/frontend/src/components/ui",
      "use": [
        {"name": "button", "path": "/app/frontend/src/components/ui/button.jsx"},
        {"name": "card", "path": "/app/frontend/src/components/ui/card.jsx"},
        {"name": "badge", "path": "/app/frontend/src/components/ui/badge.jsx"},
        {"name": "table", "path": "/app/frontend/src/components/ui/table.jsx"},
        {"name": "tabs", "path": "/app/frontend/src/components/ui/tabs.jsx"},
        {"name": "input", "path": "/app/frontend/src/components/ui/input.jsx"},
        {"name": "select", "path": "/app/frontend/src/components/ui/select.jsx"},
        {"name": "dropdown-menu", "path": "/app/frontend/src/components/ui/dropdown-menu.jsx"},
        {"name": "dialog", "path": "/app/frontend/src/components/ui/dialog.jsx"},
        {"name": "sheet", "path": "/app/frontend/src/components/ui/sheet.jsx"},
        {"name": "scroll-area", "path": "/app/frontend/src/components/ui/scroll-area.jsx"},
        {"name": "separator", "path": "/app/frontend/src/components/ui/separator.jsx"},
        {"name": "tooltip", "path": "/app/frontend/src/components/ui/tooltip.jsx"},
        {"name": "calendar", "path": "/app/frontend/src/components/ui/calendar.jsx"},
        {"name": "sonner", "path": "/app/frontend/src/components/ui/sonner.jsx"}
      ]
    },
    "admin_unique_components_to_create": [
      {
        "name": "AdminShell",
        "purpose": "Wrap all /admin routes with sidebar/topbar layout + theme scope",
        "notes": "Use <div data-theme=\"admin\"> at the root of this shell."
      },
      {
        "name": "KpiCard",
        "purpose": "Consistent KPI cards with delta, sparkline slot, and drilldown link",
        "states": ["loading skeleton", "good", "warning", "bad"]
      },
      {
        "name": "StatusPill",
        "purpose": "Unified status badge for hotel billing status, commission status",
        "notes": "Always include icon + text; color + label + tooltip"
      },
      {
        "name": "DenseDataTable",
        "purpose": "Table with sticky header, row hover actions, keyboard nav, and empty states",
        "notes": "Use shadcn Table primitives; implement compact paddings."
      },
      {
        "name": "VerificationDrawer",
        "purpose": "Right-side Sheet for manual commission verification (on-chain fields + actions)"
      }
    ],
    "buttons": {
      "variants": {
        "primary": "Authoritative solid teal; hover darkens slightly; focus ring visible",
        "secondary": "Tonal gray; used for filters",
        "ghost": "Icon buttons in tables; appear on row hover"
      },
      "radius": "rounded-lg (8-12px feel via --radius=0.75rem)",
      "motion": {
        "hover": "bg shade shift + subtle translate-y-[-1px] on primary only",
        "press": "scale-95 (only on buttons), duration-150",
        "rule": "Never use transition: all"
      }
    },
    "tables": {
      "density": {
        "row_height": "44px (desktop), 52px (mobile)",
        "cell_padding": "py-2.5 px-3 (desktop), py-3 px-3 (mobile)",
        "header": "sticky top-0 bg-card/95 backdrop-blur supports; border-b"
      },
      "features": [
        "Column alignment: numbers right-aligned; IDs monospace",
        "Row hover reveals quick actions (Verify, Mark Paid, Suspend) via ghost buttons",
        "Multi-select with checkbox column for bulk actions",
        "Empty state with 'Clear filters' CTA",
        "Skeleton rows while loading"
      ]
    },
    "alerts_and_toasts": {
      "banners": "Use Alert component for Billing Status Alerts; include primary CTA buttons.",
      "toasts": {
        "library": "sonner",
        "path": "/app/frontend/src/components/ui/sonner.jsx",
        "rules": [
          "Use toast for confirmations (Marked paid, Suspended hotel)",
          "Use destructive toast for irreversible actions with undo if possible"
        ]
      }
    }
  },
  "data_viz": {
    "library": {
      "recommended": "recharts",
      "why": "Fast to implement, good for admin analytics (line, area, bar) and responsive containers."
    },
    "install": {
      "commands": ["npm i recharts"],
      "usage_scaffold_js": "import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';\n\nexport default function MiniSparkline({ data }) {\n  return (\n    <div data-testid=\"kpi-sparkline\" className=\"h-10 w-full\">\n      <ResponsiveContainer width=\"100%\" height=\"100%\">\n        <LineChart data={data}>\n          <XAxis dataKey=\"x\" hide />\n          <YAxis hide domain={['dataMin', 'dataMax']} />\n          <Tooltip contentStyle={{ fontSize: 12 }} />\n          <Line type=\"monotone\" dataKey=\"y\" stroke=\"hsl(var(--primary))\" strokeWidth={2} dot={false} />\n        </LineChart>\n      </ResponsiveContainer>\n    </div>\n  );\n}\n"
    },
    "chart_palette": {
      "categorical_max_series": 6,
      "series_colors": [
        "hsl(var(--primary))",
        "hsl(200 80% 40%)",
        "hsl(152 62% 36%)",
        "hsl(38 92% 50%)",
        "hsl(0 72% 50%)",
        "hsl(222 10% 42%)"
      ],
      "rules": [
        "Never put red and green adjacent at same lightness for key comparisons",
        "Always label chart lines; do not rely only on color"
      ]
    }
  },
  "motion_and_microinteractions": {
    "library": {
      "recommended": "framer-motion",
      "install": ["npm i framer-motion"],
      "usage": "Use for page transitions, KPI entrance, and row action reveals (keep subtle)."
    },
    "principles": [
      "Motion supports meaning: status change, new activity, successful verification",
      "Keep durations 140–220ms, easing 'ease-out'",
      "Prefer opacity + y-translate of small amounts (4–8px)"
    ],
    "patterns": {
      "new_activity_pulse": "Tiny dot indicator animates once when a new booking arrives; do not animate entire row.",
      "table_row_hover": "Show action buttons with opacity transition only (no layout shift).",
      "kpi_cards": "Stagger-in on first load; no repeated animation on every refresh."
    }
  },
  "accessibility": {
    "requirements": [
      "WCAG AA contrast for all text",
      "Keyboard navigable tables and menus",
      "Visible focus ring using --ring",
      "Never rely on color alone for status (pair with icon + label)",
      "Use aria-label for icon-only buttons"
    ]
  },
  "testing_attributes": {
    "rule": "All interactive and key informational elements MUST have data-testid in kebab-case.",
    "examples": [
      "data-testid=\"admin-login-submit-button\"",
      "data-testid=\"admin-sidebar-hotels-link\"",
      "data-testid=\"platform-kpi-total-revenue\"",
      "data-testid=\"commission-table-row-verify-button\"",
      "data-testid=\"billing-alerts-grace-list\""
    ]
  },
  "image_urls": {
    "decorative_backgrounds": [
      {
        "category": "admin-login-bg",
        "description": "Subtle abstract texture behind the login card (use low opacity + blur).",
        "url": "https://images.unsplash.com/photo-1583444058189-275f9039e32d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbmF2eSUyMGFic3RyYWN0JTIwdGV4dHVyZXxlbnwwfHx8Ymx1ZXwxNzczNjA3Mjg4fDA&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "header-accent",
        "description": "Optional very thin (8–16px) top accent strip background image (keep <20% viewport).",
        "url": "https://images.unsplash.com/photo-1642754389554-50ec2f21a513?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMHRlYWwlMjBub2lzZSUyMGdyYWRpZW50JTIwYmFja2dyb3VuZHxlbnwwfHx8dGVhbHwxNzczNjA3Mjg1fDA&ixlib=rb-4.1.0&q=85"
      }
    ]
  },
  "implementation_tokens_and_classes": {
    "admin_theme_css_snippet": "/* index.css: add admin theme without breaking existing themes */\n[data-theme='admin'] {\n  --background: 210 20% 98%;\n  --foreground: 222 22% 10%;\n  --card: 0 0% 100%;\n  --card-foreground: 222 22% 10%;\n  --muted: 215 25% 95%;\n  --muted-foreground: 222 10% 42%;\n  --border: 214 18% 86%;\n  --input: 214 18% 86%;\n\n  /* Bitsy teal anchor */\n  --primary: 171 80% 40%;\n  --primary-foreground: 0 0% 100%;\n  --ring: 171 80% 40%;\n\n  /* Admin shell specific */\n  --admin-sidebar: 222 47% 11%;\n  --admin-sidebar-foreground: 210 25% 96%;\n  --admin-sidebar-muted: 222 35% 16%;\n  --admin-sidebar-border: 222 25% 18%;\n\n  --shadow-ring: 0 0 0 4px rgba(20, 184, 166, 0.18);\n}\n",
    "admin_shell_tailwind": {
      "root": "min-h-screen bg-background text-foreground",
      "shell": "grid lg:grid-cols-[280px_1fr]",
      "sidebar": "hidden lg:flex flex-col bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-sidebar-foreground))] border-r border-[hsl(var(--admin-sidebar-border))]",
      "topbar": "sticky top-0 z-30 flex h-14 items-center gap-3 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b",
      "content": "p-4 sm:p-6 lg:p-8"
    },
    "dense_table_classes": {
      "table_wrapper": "rounded-xl border bg-card shadow-[var(--shadow-sm)] overflow-hidden",
      "thead": "sticky top-0 z-10 bg-card/95 backdrop-blur border-b",
      "th": "px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
      "td": "px-3 py-2.5 text-sm",
      "row": "hover:bg-muted/60",
      "row_actions": "opacity-0 group-hover:opacity-100 transition-opacity duration-150"
    },
    "kpi_card_classes": {
      "card": "rounded-xl border bg-card shadow-[var(--shadow-sm)]",
      "header": "flex items-start justify-between gap-3",
      "label": "text-xs font-medium text-muted-foreground",
      "value": "mt-2 text-2xl sm:text-3xl font-semibold tabular-nums",
      "delta": "mt-2 inline-flex items-center gap-1 text-xs"
    }
  },
  "instructions_to_main_agent": [
    "Do NOT modify existing :root theme tokens for guest/marketplace; add a new [data-theme='admin'] block in index.css and wrap admin routes with it.",
    "Admin UI must be desktop-optimized: default show sidebar; mobile uses Sheet (drawer) navigation.",
    "Use shadcn ui components ONLY (from /src/components/ui) for dropdowns, dialogs, sheets, tabs, calendar, etc.",
    "Build a reusable DenseDataTable wrapper with compact spacing + sticky headers + empty states.",
    "Every button/input/link/menu item and key KPI/alert text MUST include a stable data-testid attribute.",
    "Avoid gradients; if any decorative accent is used, keep it to a small header strip (<= 20% viewport).",
    "Use Azeret Mono for ids/hashes/timestamps and ensure copy-to-clipboard actions in tables (with tooltip + toast)."
  ],
  "General_UI_UX_Design_Guidelines": "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
}
