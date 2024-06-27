const COLOR_CLASSES = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500"
]

// Consistent number based on the assistant id (string) of a given range
export function getColorById(id: string) {
  if (!id || typeof id !== "string") {
    console.error("Invalid id:", id)
    return null
  }

  const sumOfCharCodes = id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colorIndex = sumOfCharCodes % COLOR_CLASSES.length

  return COLOR_CLASSES[colorIndex]
}
