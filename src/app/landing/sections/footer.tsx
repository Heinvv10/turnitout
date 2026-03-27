import Link from "next/link"
import { Shield } from "lucide-react"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Institutional", href: "/institutional" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "https://wa.me/27601234567" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Terms", href: "/terms" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-background/70">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/60 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-background/10 pt-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-background/60" />
            <span className="text-sm font-bold text-background">TurnItOut</span>
          </div>
          <p className="text-xs text-background/50">
            Built for South African students &middot; &copy; 2026 TurnItOut
          </p>
        </div>
      </div>
    </footer>
  )
}
