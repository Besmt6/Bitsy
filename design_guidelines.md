{
  "brand": {
    "name": "Bitsy",
    "design_personality": [
      "premium-modern hospitality",
      "crypto-native trust-first",
      "glass + crisp typography",
      "mobile-first utility",
      "quietly confident (no loud gradients)"
    ],
    "visual_separation_strategy": {
      "hotel_dashboard": "Darker, more technical. Keep existing dark mode + glass panels.",
      "guest_dashboard": "Lighter + warmer neutrals with teal/ocean accents; feels like travel concierge.",
      "public_marketplace": "Bright-neutral with strong trust chips + proof panels; minimal friction to browse."
    }
  },

  "design_tokens": {
    "note": "Project already defines CSS vars in /app/frontend/src/index.css. Keep them, but introduce scoped guest/marketplace tokens via data-theme attributes so hotel dashboard stays consistent.",

    "css_custom_properties": {
      ":root_existing": {
        "--primary": "203 90% 40% (ocean blue)",
        "--accent": "171 52% 42% (teal)",
        "--radius": "0.75rem",
        "--font-heading": "Space Grotesk",
        "--font-body": "Inter",
        "--font-mono": "Azeret Mono"
      },

      "add_scoped_themes": {
        "guest_theme_selector": "[data-theme='guest']",
        "marketplace_theme_selector": "[data-theme='marketplace']",
        "token_block_to_add_in_index_css": "/* Scoped themes to differentiate guest + marketplace without breaking hotel dashboard */\n[data-theme='guest'] {\n  --background: 210 20% 98%;\n  --foreground: 222 22% 10%;\n  --card: 0 0% 100%;\n  --card-foreground: 222 22% 10%;\n  --muted: 210 20% 96%;\n  --muted-foreground: 220 10% 40%;\n  --border: 214 18% 88%;\n  --input: 214 18% 88%;\n  --primary: 200 92% 38%;\n  --primary-foreground: 0 0% 100%;\n  --accent: 168 52% 38%;\n  --accent-foreground: 0 0% 100%;\n  --ring: 200 92% 38%;\n  --shadow-sm: 0 1px 2px rgba(2, 6, 23, 0.06);\n  --shadow-md: 0 18px 45px rgba(2, 6, 23, 0.10);\n  --noise-opacity: 0.05;\n}\n\n[data-theme='marketplace'] {\n  --background: 36 45% 97%; /* warm paper */\n  --foreground: 222 22% 10%;\n  --card: 0 0% 100%;\n  --card-foreground: 222 22% 10%;\n  --muted: 40 30% 94%;\n  --muted-foreground: 220 10% 38%;\n  --border: 30 18% 85%;\n  --input: 30 18% 85%;\n  --primary: 202 88% 36%;\n  --primary-foreground: 0 0% 100%;\n  --accent: 24 90% 55%; /* peach CTA accent */\n  --accent-foreground: 0 0% 8%;\n  --ring: 202 88% 36%;\n  --shadow-sm: 0 1px 2px rgba(2, 6, 23, 0.06);\n  --shadow-md: 0 20px 60px rgba(2, 6, 23, 0.10);\n  --noise-opacity: 0.06;\n}\n"
      },

      "semantic_colors": {
        "status": {
          "pending": {
            "bg": "hsl(var(--warning) / 0.14)",
            "text": "hsl(var(--warning))",
            "border": "hsl(var(--warning) / 0.30)"
          },
          "confirmed": {
            "bg": "hsl(var(--success) / 0.14)",
            "text": "hsl(var(--success))",
            "border": "hsl(var(--success) / 0.30)"
          },
          "cancelled": {
            "bg": "hsl(var(--destructive) / 0.12)",
            "text": "hsl(var(--destructive))",
            "border": "hsl(var(--destructive) / 0.28)"
          },
          "listed": {
            "bg": "hsl(var(--accent) / 0.14)",
            "text": "hsl(var(--accent))",
            "border": "hsl(var(--accent) / 0.30)"
          }
        },
        "trust": {
          "verified": "hsl(var(--accent))",
          "proof_panel_bg": "hsl(var(--muted))",
          "mono_text": "hsl(var(--muted-foreground))"
        }
      },

      "gradients_and_textures": {
        "rule": "Gradients only as subtle section backgrounds (<=20% viewport). No saturated purple/pink combos. No gradients on small elements.",
        "allowed_background_gradients": [
          "Guest hero wash: radial-gradient(1200px circle at 10% 0%, hsla(168, 52%, 38%, 0.12), transparent 55%), radial-gradient(900px circle at 90% 10%, hsla(200, 92%, 38%, 0.10), transparent 60%)",
          "Marketplace header wash: radial-gradient(1000px circle at 0% 0%, hsla(24, 90%, 55%, 0.10), transparent 55%), radial-gradient(900px circle at 100% 0%, hsla(202, 88%, 36%, 0.10), transparent 60%)"
        ],
        "noise": "Use existing .bitsy-noise utility. Apply to large containers with relative positioning."
      },

      "radius_and_shadows": {
        "radius_scale": {
          "sm": "8px",
          "md": "12px (default --radius)",
          "lg": "16px",
          "xl": "22px (hero / spotlight cards)"
        },
        "shadow_usage": {
          "cards": "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
          "focus": "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        }
      }
    }
  },

  "typography": {
    "font_pairing": {
      "headings": "Space Grotesk (already loaded)",
      "body": "Inter (already loaded)",
      "mono": "Azeret Mono (tx hash, booking ref, wallet addresses)"
    },
    "text_size_hierarchy": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-heading tracking-tight",
      "h2": "text-base md:text-lg text-muted-foreground",
      "section_title": "text-xl md:text-2xl font-heading",
      "card_title": "text-base md:text-lg font-heading",
      "body": "text-sm md:text-base",
      "small": "text-xs md:text-sm",
      "mono_small": "text-xs font-mono"
    },
    "numerals": "Use tabular-nums for prices, dates, counts: class 'tabular-nums'."
  },

  "layout": {
    "grid_system": {
      "guest_dashboard": {
        "container": "max-w-6xl mx-auto px-4 sm:px-6",
        "page_top_padding": "pt-6 sm:pt-10",
        "desktop_layout": "Two-column on lg: left = content, right = sticky summary / trust panel",
        "sticky": "lg:sticky lg:top-6"
      },
      "marketplace": {
        "container": "max-w-7xl mx-auto px-4 sm:px-6",
        "listing_grid": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
        "filters": "Mobile: Drawer; Desktop: left rail (w-72) + results"
      },
      "embedded_widget": {
        "container": "w-full max-w-md",
        "stepper": "Compact stepper with 3-4 steps; avoid dense tables",
        "touch_targets": "min-h-[44px] for primary controls"
      }
    },

    "information_hierarchy": {
      "booking_status": "Status pill always in the first row, next to booking ref.",
      "payment_method": "Second row: Payment method chip (Crypto default) + clear explanation.",
      "trust": "Right rail or below fold on mobile: Proof panel (tx hash / signature / hotel confirmation state)."
    }
  },

  "components": {
    "primary_component_library": "shadcn/ui in /app/frontend/src/components/ui (JS files)",
    "component_path": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "table": "/app/frontend/src/components/ui/table.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "alert_dialog": "/app/frontend/src/components/ui/alert-dialog.jsx",
      "drawer": "/app/frontend/src/components/ui/drawer.jsx",
      "sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "radio_group": "/app/frontend/src/components/ui/radio-group.jsx",
      "separator": "/app/frontend/src/components/ui/separator.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "hover_card": "/app/frontend/src/components/ui/hover-card.jsx",
      "breadcrumb": "/app/frontend/src/components/ui/breadcrumb.jsx",
      "calendar": "/app/frontend/src/components/ui/calendar.jsx",
      "sonner_toasts": "/app/frontend/src/components/ui/sonner.jsx",
      "skeleton": "/app/frontend/src/components/ui/skeleton.jsx"
    },

    "component_recipes": {
      "status_pills": {
        "base": "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border",
        "examples": {
          "pending": "bg-[hsl(var(--warning)/0.14)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.30)]",
          "confirmed": "bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.30)]",
          "cancelled": "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.28)]",
          "listed": "bg-[hsl(var(--accent)/0.14)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.30)]"
        },
        "iconography": "Use lucide-react icons (CheckCircle2, Clock, XCircle, ArrowLeftRight) as 14px."
      },

      "trust_proof_panel": {
        "container": "rounded-xl border bg-card shadow-[var(--shadow-sm)] p-4 sm:p-5",
        "header": "flex items-start justify-between gap-3",
        "body": "mt-3 space-y-3",
        "tx_hash_row": "flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2",
        "tx_hash_text": "font-mono text-xs text-muted-foreground truncate",
        "copy_button": "Use Button variant='ghost' size='sm' with data-testid='copy-tx-hash-button'"
      },

      "glass_card_variant": {
        "when": "Use in hotel dashboard and for marketplace highlights only (not dense reading areas).",
        "classes": "bg-white/60 backdrop-blur-md border border-white/50 shadow-[0_20px_50px_rgba(2,6,23,0.12)]"
      },

      "filters_drawer_mobile": {
        "component": "Drawer",
        "pattern": "Floating bottom sheet with sticky Apply/Reset bar",
        "sticky_bar": "sticky bottom-0 bg-background/80 backdrop-blur border-t p-3 flex gap-2"
      }
    },

    "buttons": {
      "style": "Luxury / Elegant: tall, rounded (8–12px), subtle elevation",
      "base_classes": "rounded-[calc(var(--radius)-2px)]",
      "variants": {
        "primary": "Use shadcn Button default; ensure height via h-11 px-4 and shadow-sm",
        "secondary": "Button variant='secondary' with border: 'border border-border'",
        "ghost": "Button variant='ghost' for copy/share actions",
        "destructive": "Button variant='destructive' for Cancel booking"
      },
      "micro_interactions": {
        "hover": "hover:brightness-[0.98] hover:shadow-[var(--shadow-md)] (apply only to buttons/cards, not entire containers)",
        "press": "active:scale-[0.98] transition-[box-shadow,filter] duration-200",
        "focus": "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      }
    }
  },

  "page_blueprints": {
    "guest_login_page_/guest": {
      "theme": "data-theme='guest'",
      "layout": "Centered column but left-aligned text; show concierge-style panel.",
      "structure": [
        "Top: Bitsy wordmark + 'Guest lookup'",
        "Card: Email + Phone inputs (no password) + Continue",
        "Side helper (on md+): 'Why we ask for phone' + privacy note"
      ],
      "shadcn": ["Card", "Input", "Label", "Button", "Separator"],
      "data_testids": {
        "email": "guest-lookup-email-input",
        "phone": "guest-lookup-phone-input",
        "submit": "guest-lookup-submit-button"
      }
    },

    "my_bookings_/guest/bookings": {
      "theme": "data-theme='guest'",
      "structure": [
        "Header row: 'My bookings' + Search (ref/hotel) + New: Marketplace link chip",
        "Tabs: Upcoming / Past / Cancelled",
        "List cards: each booking card shows hotel, dates, status pill, payment method chip, primary action 'View details'"
      ],
      "components": ["Tabs", "Card", "Badge", "Button", "Input", "Skeleton"],
      "micro_interactions": "Card hover raises shadow + subtle translate-y-[-1px] (transition-[box-shadow,filter] only; avoid transition-all).",
      "data_testids": {
        "tabs": "guest-bookings-tabs",
        "search": "guest-bookings-search-input",
        "booking_card": "guest-booking-card",
        "view_details": "guest-booking-view-details-button"
      }
    },

    "booking_details_/guest/bookings/:ref": {
      "theme": "data-theme='guest'",
      "layout": "Content + right rail trust panel (tx + hotel confirmation state).",
      "left_column": [
        "Booking summary card (hotel, room, guest, dates)",
        "Actions row: Cancel (destructive), List for transfer (accent-outline), Download receipt",
        "Timeline: Created → Paid/Pay-at-property pending → Confirmed",
        "Policy accordion (cancellation, pay-at-property instructions)"
      ],
      "right_rail": [
        "Trust proof panel (tx hash / signature / wallet)",
        "Hotel contact card (call to confirm for pay-at-property)",
        "Marketplace eligibility chip: only crypto-paid bookings can list"
      ],
      "components": ["Card", "Accordion", "AlertDialog", "Badge", "Button", "Separator", "Tooltip"],
      "data_testids": {
        "cancel": "guest-booking-cancel-button",
        "list_transfer": "guest-booking-list-transfer-button",
        "tx_hash": "guest-booking-tx-hash-value"
      }
    },

    "marketplace_browse_/marketplace": {
      "theme": "data-theme='marketplace'",
      "layout": "Desktop: filters rail + grid. Mobile: sticky filter bar + Drawer.",
      "structure": [
        "Header: 'Marketplace' + short explanation 'Free transfers for crypto-paid bookings'",
        "Trust strip: Verified ownership, On-chain proof, No commission (3 mini cards)",
        "Filters: city/date/price/hotel rating/payment network",
        "Results grid: listing card with hotel image, date range, savings badge, verified pill, tx preview chip"
      ],
      "components": ["Card", "Drawer", "Select", "Slider", "Badge", "Button", "Skeleton"],
      "data_testids": {
        "open_filters": "marketplace-open-filters-button",
        "listing_card": "marketplace-listing-card",
        "filters_apply": "marketplace-filters-apply-button"
      }
    },

    "listing_details_/marketplace/:listingId": {
      "theme": "data-theme='marketplace'",
      "layout": "Hero media left, purchase module right (sticky on lg).",
      "purchase_module": [
        "Price breakdown (original vs transfer price)",
        "Ownership verified panel (tx hash + wallet)",
        "CTA: 'Purchase & transfer'",
        "Proof submission step (upload or paste tx hash)"
      ],
      "components": ["Card", "Dialog", "HoverCard", "Badge", "Button", "Input", "Textarea"],
      "data_testids": {
        "purchase": "marketplace-purchase-button",
        "proof_input": "marketplace-proof-input",
        "submit_proof": "marketplace-submit-proof-button"
      }
    },

    "marketplace_list_flow_/guest/marketplace/list": {
      "theme": "data-theme='guest'",
      "structure": [
        "Stepper: Select booking → Prove ownership → Set price → Lock listing",
        "Ownership proof: paste tx hash or sign message",
        "Price input with suggested range and 'Free listing' badge",
        "Lock listing: explains that booking becomes non-cancellable while listed"
      ],
      "components": ["Card", "Progress", "RadioGroup", "Input", "Dialog", "Alert"],
      "data_testids": {
        "price": "marketplace-list-price-input",
        "lock": "marketplace-lock-listing-button"
      }
    },

    "hotel_dashboard_bookings_/dashboard/bookings": {
      "theme": "existing hotel dashboard theme (do not override)",
      "structure": [
        "Table with powerful filters: status, payment method, date range",
        "Row actions: Confirm / Reject (only for pay-at-property pending), View details",
        "Bulk actions: export CSV"
      ],
      "components": ["Table", "Tabs", "Select", "Calendar", "Dialog", "Badge", "Button"],
      "data_testids": {
        "bookings_table": "hotel-bookings-table",
        "confirm": "hotel-booking-confirm-button",
        "reject": "hotel-booking-reject-button"
      }
    },

    "widget_payment_method_step": {
      "theme": "match existing widget; keep crypto as default recommended",
      "ui": {
        "component": "RadioGroup with 2 cards (Crypto recommended / Pay at property)",
        "recommended_label": "Badge 'Recommended' on Crypto",
        "eligibility_note": "If hotel disables pay-at-property, hide option rather than disabling.",
        "confirmation_copy": {
          "crypto": "'Payment confirmed on-chain. You're booked.'",
          "pay_at_property": "'Your booking is pending. Please call the hotel to confirm.'"
        }
      },
      "data_testids": {
        "payment_method": "widget-payment-method-radio-group",
        "crypto_option": "widget-payment-method-crypto-option",
        "property_option": "widget-payment-method-pay-at-property-option"
      }
    }
  },

  "motion_and_micro_interactions": {
    "library": {
      "recommendation": "framer-motion",
      "install": "npm i framer-motion",
      "usage": "Use for page transitions (opacity+translateY 8px), card hover lift, stepper transitions. Avoid heavy animations in widget."
    },
    "principles": [
      "Entrance: 160–220ms, ease-out, small distance (6–10px)",
      "Hover: shadow increase + brightness tweak; do NOT animate transform on everything",
      "Loading: Skeletons for cards/tables; optimistic toasts for actions"
    ],
    "snippets_js": {
      "card_hover": "<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} whileHover={{ y: -2 }} />"
    }
  },

  "data_testid_rules": {
    "mandatory": true,
    "naming": "kebab-case, role-based",
    "examples": [
      "guest-lookup-submit-button",
      "guest-booking-cancel-button",
      "marketplace-open-filters-button",
      "widget-payment-method-radio-group"
    ]
  },

  "accessibility": {
    "wcag": "AA",
    "focus": "Always visible focus ring (use --ring).",
    "contrast": "No low-contrast muted text on warm marketplace background; bump muted-foreground darker if needed.",
    "motion": "Respect prefers-reduced-motion: reduce entrance transitions to opacity only."
  },

  "image_urls": [
    {
      "category": "marketplace_listing_card",
      "description": "Use as hotel imagery placeholder in listing cards (crop to 16:10, add subtle overlay gradient only on image).",
      "url": "https://images.unsplash.com/photo-1652963426007-0d189dee3c56?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwbW9kZXJuJTIwbWluaW1hbHxlbnwwfHx8dGVhbHwxNzczNTg3NTc1fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      "category": "guest_dashboard_header_visual",
      "description": "Optional subtle header image for guest login/lookup (blurred + darkened behind card).",
      "url": "https://images.unsplash.com/photo-1584973547886-92c625508e24?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwbW9kZXJuJTIwbWluaW1hbHxlbnwwfHx8dGVhbHwxNzczNTg3NTc1fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      "category": "booking_details_media",
      "description": "Use for booking detail hero media (room photo).",
      "url": "https://images.unsplash.com/photo-1558027807-3bd4fac2528c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbSUyMG1pbmltYWxpc3R8ZW58MHx8fGJsdWV8MTc3MzU4NzU4MHww&ixlib=rb-4.1.0&q=85"
    }
  ],

  "instructions_to_main_agent": [
    "Do NOT change existing hotel dashboard styling globally. Introduce [data-theme='guest'] and [data-theme='marketplace'] wrappers on new routes only.",
    "All pages/components must be built in React .js (not .tsx).",
    "Use shadcn/ui components from /app/frontend/src/components/ui only (no raw HTML dropdowns/calendars).",
    "Every interactive + key informational element must include data-testid.",
    "Marketplace: always show trust indicators above the fold: Verified badge + tx hash snippet + 'Free transfers' explanation.",
    "Widget payment method selection: use RadioGroup card options; default to crypto and label as Recommended. Hide pay-at-property if disabled.",
    "Avoid transition: all. Use transition-[box-shadow,filter,opacity,background-color,border-color] as needed.",
    "Use lucide-react icons only (no emojis)."
  ],

  "appendix_general_ui_ux_design_guidelines": [
    "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms",
    "- You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text",
    "- NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json",
    "\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc\n",
    "\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead.\n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
  ]
}
