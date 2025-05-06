"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Globe } from "lucide-react"
import Link from "next/link"
import NavMenu from "@/components/nav-menu"
import MobileMenu from "@/components/mobile-menu"
import RaisedText from "@/components/raised-text"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es")
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="bg-[#50A58D] text-white sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <RaisedText text="CROMU" className="text-white text-2xl font-moul" />
          </Link>

          <div className="flex items-center space-x-4">
            <NavMenu />

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="text-white hover:bg-white/20"
                aria-label={language === "es" ? "Switch to English" : "Cambiar a Español"}
              >
                <Globe className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-white hover:bg-white/20"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>

            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

