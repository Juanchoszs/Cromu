"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "framer-motion"

interface CountUpAnimationProps {
  end: number
  duration?: number
  delay?: number
}

export default function CountUpAnimation({ end, duration = 2, delay = 0 }: CountUpAnimationProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!isInView || hasAnimated) return

    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setHasAnimated(true)
      }
    }

    const timeoutId = setTimeout(() => {
      window.requestAnimationFrame(step)
    }, delay * 1000)

    return () => clearTimeout(timeoutId)
  }, [isInView, end, duration, delay, hasAnimated])

  return (
    <span ref={ref} className="text-2xl font-bold text-emerald-700">
      {new Intl.NumberFormat().format(count)}
    </span>
  )
}

