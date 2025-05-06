import type React from "react"

interface RaisedTextProps {
  text: string
  className?: string
}

const RaisedText: React.FC<RaisedTextProps> = ({ text, className = "" }) => {
  return (
    <span className={`inline-block relative ${className}`}>
      {text.split("").map((char, index) => {
        if (char === "O") {
          return (
            <span key={index} className="inline-block relative -top-1">
              {char}
            </span>
          )
        }
        return <span key={index}>{char}</span>
      })}
    </span>
  )
}

export default RaisedText

