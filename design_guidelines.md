{
  "product": {
    "name": "Bitsy SaaS",
    "tagline": "Embeddable AI booking assistant for hotels — with direct crypto payments.",
    "brand_attributes": [
      "trustworthy (payments-first)",
      "calm + premium hospitality",
      "efficient B2B SaaS",
      "friendly AI concierge"
    ],
    "design_style_fusion": {
      "layout_principle": "Swiss-style + Bento grid (clear hierarchy, generous whitespace)",
      "surface": "Soft-elevated cards with subtle grain (not glass everywhere)",
      "accent_personality": "crypto-tech accents (ocean blue + seafoam) with a warm amber warning system",
      "widget_personality": "concierge-like, conversational, compact, highly legible"
    }
  },

  "typography": {
    "google_fonts": {
      "heading": {
        "family": "Space Grotesk",
        "weights": ["500", "600", "700"],
        "usage": "Dashboard headings, widget titles, KPI labels"
      },
      "body": {
        "family": "Inter",
        "weights": ["400", "500", "600"],
        "usage": "Forms, tables, helper text, chat messages"
      },
      "mono": {
        "family": "Azeret Mono",
        "weights": ["400", "500"],
        "usage": "Embed code blocks, wallet addresses, transaction refs"
      },
      "import_snippet_css": "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=Azeret+Mono:wght@400;500&display=swap');"
    },
    "tailwind_font_mapping": {
      "font-sans": "Inter, ui-sans-serif, system-ui",
      "font-heading": "Space Grotesk, Inter, ui-sans-serif",
      "font-mono": "Azeret Mono, ui-monospace"
    },
    "type_scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-heading font-700 tracking-tight",
      "h2": "text-base md:text-lg font-sans text-muted-foreground",
      "section_title": "text-xl sm:text-2xl font-heading font-600",
      "card_title": "text-base font-heading font-600",
      "body": "text-sm sm:text-base font-sans",
      "small": "text-xs text-muted-foreground",
      "kpi": "text-2xl sm:text-3xl font-heading font-700 tabular-nums"
    }
  },

  "color_system": {
    "notes": [
      "Avoid purple as a dominant theme; keep crypto feel via ocean blue + seafoam + graphite.",
      "Gradients are decorative only (≤20% viewport) and never behind dense text blocks.",
      "Non-refundable must use a dedicated high-contrast warning palette (amber + ink)."
    ],
    "palette": {
      "ink": "0 0% 7%",
      "paper": "0 0% 100%",
      "mist": "210 33% 98%",
      "graphite": "222 16% 22%",
      "ocean": "203 90% 40%",
      "seafoam": "171 52% 42%",
      "amber": "38 92% 50%",
      "danger": "0 74% 52%",
      "success": "152 62% 36%"
    },
    "semantic_tokens_hsl": {
      "--background": "0 0% 100%",
      "--foreground": "0 0% 7%",

      "--card": "0 0% 100%",
      "--card-foreground": "0 0% 7%",

      "--popover": "0 0% 100%",
      "--popover-foreground": "0 0% 7%",

      "--primary": "203 90% 40%",
      "--primary-foreground": "0 0% 100%",

      "--secondary": "210 33% 96%",
      "--secondary-foreground": "222 16% 22%",

      "--muted": "210 33% 96%",
      "--muted-foreground": "222 12% 45%",

      "--accent": "171 52% 42%",
      "--accent-foreground": "0 0% 100%",

      "--destructive": "0 74% 52%",
      "--destructive-foreground": "0 0% 100%",

      "--border": "214 20% 90%",
      "--input": "214 20% 90%",
      "--ring": "203 90% 40%",

      "--radius": "0.75rem",

      "--warning": "38 92% 50%",
      "--warning-foreground": "0 0% 7%",
      "--success": "152 62% 36%",
      "--success-foreground": "0 0% 100%"
    },
    "allowed_gradients": {
      "hero_wash": {
        "usage": "Dashboard top header strip only (decorative, max ~140px height)",
        "css": "radial-gradient(1200px 280px at 20% 0%, rgba(20,184,166,0.18) 0%, rgba(255,255,255,0) 60%), radial-gradient(900px 260px at 80% 10%, rgba(14,165,233,0.16) 0%, rgba(255,255,255,0) 55%)"
      },
      "widget_accent": {
        "usage": "Tiny accent pill behind 'Powered by Bitsy' (small area, not text-heavy)",
        "css": "linear-gradient(135deg, rgba(14,165,233,0.18), rgba(20,184,166,0.18))"
      }
    },
    "forbidden_gradients": [
      "blue-500 to purple-600",
      "purple-500 to pink-500",
      "green-500 to blue-500",
      "red to pink",
      "any dark saturated gradients used on reading areas"
    ]
  },

  "design_tokens_css": {
    "where": "Update /app/frontend/src/index.css :root + .dark (optional). Also remove centered CRA leftovers from App.css.",
    "css_custom_properties": "/* Bitsy tokens (add under @layer base :root) */\n:root {\n  --radius: 0.75rem;\n  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);\n  --shadow-md: 0 10px 24px rgba(15, 23, 42, 0.10);\n  --shadow-ring: 0 0 0 4px rgba(14, 165, 233, 0.18);\n  --noise-opacity: 0.035;\n\n  --font-heading: 'Space Grotesk', ui-sans-serif, system-ui;\n  --font-body: 'Inter', ui-sans-serif, system-ui;\n  --font-mono: 'Azeret Mono', ui-monospace, SFMono-Regular;\n}\n\nhtml, body {\n  font-family: var(--font-body);\n}\n\n/* subtle noise utility (apply via className) */\n.bitsy-noise::before {\n  content: '';\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"180\" height=\"180\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"180\" height=\"180\" filter=\"url(%23n)\" opacity=\"1\"/></svg>');\n  opacity: var(--noise-opacity);\n  mix-blend-mode: multiply;\n}\n"
  },

  "layout_and_grid": {
    "dashboard": {
      "shell": "Left sidebar (collapsible) + top bar + content",
      "max_width": "content: max-w-6xl (forms/settings), analytics: max-w-7xl",
      "grid": {
        "kpi_row": "grid grid-cols-2 lg:grid-cols-4 gap-4",
        "settings_forms": "grid grid-cols-1 lg:grid-cols-3 gap-6 (form in 2 cols, help panel in 1 col)",
        "tables": "Card container + sticky header optional"
      },
      "navigation": {
        "pattern": "Icon + label, section groups (Hotel, Rooms, Payments, Widget, Bookings)",
        "component": "navigation-menu OR custom sidebar using Button + Tooltip + Separator",
        "mobile": "Use Sheet for sidebar; top bar keeps primary action + CmdK"
      }
    },
    "widget": {
      "floating_button": "Bottom-right by default; allow bottom-left; respects safe-area-inset",
      "modal": "Right-side Drawer on desktop (preferred) OR Dialog on small screens; never full-screen unless QR step",
      "chat": "Message list with ScrollArea; composer fixed bottom"
    }
  },

  "components": {
    "shadcn_primary_components": {
      "auth": ["/app/frontend/src/components/ui/card.jsx", "/app/frontend/src/components/ui/input.jsx", "/app/frontend/src/components/ui/button.jsx", "/app/frontend/src/components/ui/label.jsx", "/app/frontend/src/components/ui/separator.jsx"],
      "settings_forms": ["form.jsx", "textarea.jsx", "select.jsx", "switch.jsx", "tabs.jsx"],
      "rooms_management": ["table.jsx", "dialog.jsx", "alert-dialog.jsx", "dropdown-menu.jsx", "badge.jsx"],
      "wallets": ["input.jsx", "tabs.jsx", "tooltip.jsx", "popover.jsx", "badge.jsx"],
      "widget_customization": ["tabs.jsx", "slider.jsx", "radio-group.jsx", "popover.jsx", "card.jsx"],
      "embed_code": ["card.jsx", "button.jsx", "tooltip.jsx", "sonner.jsx"],
      "booking_stats": ["card.jsx", "tabs.jsx", "select.jsx", "skeleton.jsx"],
      "telegram_config": ["card.jsx", "input.jsx", "button.jsx", "alert.jsx"],
      "widget_chat": ["drawer.jsx", "dialog.jsx", "scroll-area.jsx", "textarea.jsx", "button.jsx", "badge.jsx", "alert-dialog.jsx"],
      "policy_confirmation": ["alert-dialog.jsx", "checkbox.jsx"]
    },
    "non_shadcn_recommended": {
      "charts": {
        "library": "recharts",
        "usage": "Revenue/Bookings line/area chart; small sparkline KPIs",
        "install": "npm i recharts",
        "notes": "Keep charts calm; use ocean for primary line, seafoam for secondary. No neon gradients."
      },
      "motion": {
        "library": "framer-motion",
        "install": "npm i framer-motion",
        "usage": "Widget open/close, message enter, warning shake micro-anim, copy-to-clipboard feedback"
      },
      "qr_code": {
        "library": "qrcode.react",
        "install": "npm i qrcode.react",
        "usage": "Render QR for payment address + amount + chain"
      }
    }
  },

  "component_specs": {
    "buttons": {
      "style": "Professional / Corporate with soft radius",
      "tokens": {
        "radius": "rounded-xl (maps to --radius)",
        "primary": "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-primary/90 focus-visible:shadow-[var(--shadow-ring)]",
        "secondary": "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border",
        "ghost": "hover:bg-muted/70",
        "destructive": "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      },
      "micro_interactions": [
        "Active press: active:scale-[0.98] (only on buttons)",
        "Hover: background shift + subtle shadow increase (no transition-all)",
        "Loading: spinner left + label stays (avoid layout shift)"
      ]
    },
    "cards": {
      "base": "bg-card border border-border rounded-2xl shadow-[var(--shadow-sm)]",
      "hover": "hover:shadow-[var(--shadow-md)] hover:border-border/70 (only for clickable cards)",
      "header": "flex items-start justify-between gap-4",
      "kpi_card": "p-4 sm:p-5 with small sparkline area"
    },
    "forms": {
      "inputs": "h-10 rounded-xl bg-white placeholder:text-muted-foreground/80 focus-visible:shadow-[var(--shadow-ring)]",
      "helper_text": "text-xs text-muted-foreground",
      "validation": {
        "error": "text-destructive text-xs mt-1",
        "success": "text-[color:hsl(var(--success))] text-xs mt-1"
      }
    },
    "tables": {
      "pattern": "Card-wrapped Table with filter row (Select + search Input)",
      "row_hover": "hover:bg-muted/50",
      "empty_state": "Skeleton first load; then centered message with CTA"
    },
    "badges": {
      "status": {
        "paid": "bg-[color:hsl(var(--success))]/15 text-[color:hsl(var(--success))] border border-[color:hsl(var(--success))]/20",
        "pending": "bg-[color:hsl(var(--warning))]/15 text-[color:hsl(var(--warning-foreground))] border border-[color:hsl(var(--warning))]/20",
        "failed": "bg-destructive/10 text-destructive border border-destructive/15"
      }
    }
  },

  "dashboard_page_blueprints": {
    "global_topbar": {
      "left": "Breadcrumb + page title",
      "right": "Cmd+K (Command component), Notifications (optional), Account dropdown",
      "primary_cta": "Contextual (Add room / Copy embed / Preview widget)",
      "testids": {
        "cmdk_button": "topbar-command-palette-button",
        "account_menu": "topbar-account-menu"
      }
    },
    "booking_statistics": {
      "above_fold": [
        "KPI row: Bookings (7d), Revenue (7d), Conversion, Avg. stay",
        "Chart: Revenue over time (AreaChart) + filter (7d/30d/90d)",
        "Recent bookings table"
      ],
      "chart_style": {
        "container": "Card with p-4 sm:p-6",
        "colors": "primary line ocean; secondary seafoam; grid muted",
        "tooltip": "Popover-like tooltip with Card styling"
      },
      "testids": {
        "kpi-bookings": "stats-kpi-bookings",
        "kpi-revenue": "stats-kpi-revenue",
        "revenue-chart": "stats-revenue-chart",
        "recent-bookings-table": "stats-recent-bookings-table"
      }
    },
    "widget_customization": {
      "layout": "Split: controls left (Tabs) + live preview right (sticky)",
      "controls": [
        "Brand color picker substitute: pre-set swatches + Slider for intensity (avoid heavy color picker)",
        "Position radio (BR/BL)",
        "Greeting message textarea",
        "Policy link toggle (optional)"
      ],
      "preview": {
        "frame": "Device-like Card with subtle border + background wash",
        "interaction": "Changes update instantly; show 'Saved' toast on persist"
      },
      "testids": {
        "widget-customization-color-swatch": "widget-customization-color-swatch",
        "widget-customization-position-radio": "widget-customization-position-radio",
        "widget-customization-preview": "widget-customization-preview"
      }
    },
    "embed_code": {
      "code_block": "Use mono font, ScrollArea, Copy button with Sonner toast",
      "security_note": "Inline Alert explaining no PII stored + non-refundable policy",
      "testids": {
        "embed-code-copy-button": "embed-code-copy-button",
        "embed-code-snippet": "embed-code-snippet"
      }
    }
  },

  "widget_design": {
    "principles": [
      "Lightweight: no heavy backgrounds; keep to solid surfaces",
      "Trust cues: chain badges + 'Secure direct payment' helper text",
      "Clarity: big QR + short steps",
      "Non-refundable acceptance is mandatory and visually unavoidable"
    ],
    "floating_button": {
      "size": "56px",
      "shape": "rounded-full",
      "style": "bg-primary text-white shadow-[var(--shadow-md)]",
      "hover": "hover:shadow-[0_14px_34px_rgba(15,23,42,0.18)] hover:bg-primary/90",
      "idle_animation": "Very subtle attention: after 6s idle, pulse ring once (respect prefers-reduced-motion)",
      "testid": "widget-floating-chat-button"
    },
    "container": {
      "desktop": "Drawer from right, width 380–420px, max-h: 78vh, rounded-2xl",
      "mobile": "Dialog full-height sheet-like with safe-area padding",
      "testid": "widget-chat-container"
    },
    "chat_bubbles": {
      "assistant": "bg-muted text-foreground rounded-2xl rounded-tl-md",
      "user": "bg-primary text-primary-foreground rounded-2xl rounded-tr-md",
      "timestamps": "text-[11px] text-muted-foreground",
      "testids": {
        "message-list": "widget-message-list",
        "message-composer": "widget-message-composer"
      }
    },
    "non_refundable_gate": {
      "pattern": "AlertDialog that must be accepted before QR is shown",
      "visual": "Amber header strip + bold title + concise bullet list + checkbox 'I understand'",
      "copy": {
        "title": "Non‑refundable booking",
        "bullets": [
          "Crypto payments can’t be reversed.",
          "No refunds or chargebacks after payment.",
          "Confirm dates and room type before paying."
        ],
        "confirm_label": "I understand this booking is non‑refundable",
        "cta": "Continue to payment"
      },
      "motion": "If user tries to proceed without checking box: subtle horizontal shake (framer-motion)",
      "testids": {
        "policy-dialog": "widget-nonrefundable-dialog",
        "policy-checkbox": "widget-nonrefundable-checkbox",
        "policy-continue": "widget-nonrefundable-continue-button"
      }
    },
    "qr_payment": {
      "layout": "Stepper-like (1 Review, 2 Pay, 3 Confirm) shown as small badges",
      "qr_card": "Card with centered QR (min 220px), amount + chain badge + copy address button",
      "instructions": [
        "Open your wallet",
        "Scan the QR code",
        "Send exact amount",
        "Wait for confirmation"
      ],
      "testids": {
        "payment-qr": "widget-payment-qr",
        "payment-address-copy": "widget-payment-address-copy",
        "payment-amount": "widget-payment-amount"
      }
    }
  },

  "content_and_trust": {
    "trust_markers": [
      "Inline note: “We never store guest PII. Booking reference is tokenized.”",
      "Wallet validation hint: checksum + network label",
      "Show supported chains as small badges with tooltips"
    ],
    "tone": {
      "dashboard": "confident, operational, concise",
      "widget": "warm concierge, short sentences, clear choices"
    }
  },

  "motion": {
    "rules": [
      "No transition: all. Only animate color, opacity, shadow, filter.",
      "Respect prefers-reduced-motion (disable pulses/shakes).",
      "Use 160–220ms for hover, 240–320ms for modal transitions."
    ],
    "dashboard": {
      "page_enter": "fade + 6px rise",
      "kpi_load": "skeleton shimmer then crossfade",
      "copy_embed": "button icon morph + toast"
    },
    "widget": {
      "open": "Drawer slides + backdrop fades",
      "message": "new bubble: scale(0.98)->1 + opacity",
      "warning": "shake on invalid proceed"
    }
  },

  "accessibility": {
    "musts": [
      "WCAG AA contrast for all text on backgrounds",
      "Visible focus ring using --ring and --shadow-ring",
      "Keyboard support: Esc closes widget, Tab cycles within Drawer/Dialog",
      "QR must have alt text/label + copy options for non-camera users",
      "Non-refundable dialog must be announced (AlertDialog)"
    ],
    "widget_mobile": [
      "Respect safe-area-inset-bottom for composer",
      "Buttons min 44px height",
      "Don’t rely on color alone for payment state (use icons + text)"
    ]
  },

  "data_testid_conventions": {
    "rule": "All interactive and key informational elements must include data-testid in kebab-case describing role.",
    "examples": [
      "login-form-submit-button",
      "rooms-add-room-button",
      "wallets-save-button",
      "embed-code-copy-button",
      "widget-floating-chat-button",
      "widget-payment-qr"
    ]
  },

  "image_urls": [
    {
      "category": "widget_payment_help",
      "description": "Optional small helper image/illustration in widget payment step (keep minimal).",
      "url": "https://images.unsplash.com/photo-1603899122724-98440dd9c400?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjBxciUyMGNvZGUlMjBwYXltZW50JTIwcGhvbmUlMjBzY2FufGVufDB8fHxvcmFuZ2V8MTc3MzQ4NTU4NHww&ixlib=rb-4.1.0&q=85"
    }
  ],

  "component_path": {
    "shadcn_ui_dir": "/app/frontend/src/components/ui/",
    "key_files": [
      "button.jsx",
      "card.jsx",
      "dialog.jsx",
      "drawer.jsx",
      "alert-dialog.jsx",
      "table.jsx",
      "tabs.jsx",
      "scroll-area.jsx",
      "sonner.jsx",
      "calendar.jsx"
    ]
  },

  "instructions_to_main_agent": [
    "Remove CRA default centering/dark header styles from /app/frontend/src/App.css; do not set .App { text-align: center }.",
    "Update /app/frontend/src/index.css tokens to the semantic HSL values above (primary=ocean, accent=seafoam, warning=amber).",
    "Add Google Fonts import and map fonts (Space Grotesk headings, Inter body, Azeret Mono for code).",
    "Implement dashboard shell: Sidebar + Topbar; use Sheet for mobile nav.",
    "Use Recharts for Booking Statistics; keep chart colors calm (ocean/seafoam) and grid muted.",
    "Widget: use Drawer on desktop, Dialog on mobile; floating button fixed with safe-area handling.",
    "Non-refundable: MUST gate QR behind AlertDialog + required checkbox; no bypass.",
    "Ensure every button/input/link/table action has data-testid attributes per conventions.",
    "Use Sonner toasts for copy embed code + save confirmations.",
    "No heavy gradients; only the small header wash and tiny accent pills per allowed_gradients."
  ],

  "general_ui_ux_design_guidelines": "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
}
