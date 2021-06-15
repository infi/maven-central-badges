const { createCanvas, loadImage, registerFont } = require("canvas")
const { readFileSync } = require("fs")
const { join } = require("path")
const xml2js = require("xml2js")

export default async (req, res) => {
  if (!req.query.for) return res.status(400).json({ error: "The \"for\" query parameter is required." })
  const response = await fetch(`https://repo1.maven.org/maven2/${req.query.for.replace(/\./g, "/")}/maven-metadata.xml`)
  if (response.status !== 200) return res.status(400).json({ error: "Invalid package or failed to fetch current version" })

  let latest

  try {
    const data = await xml2js.parseStringPromise(await response.text())
    const metadata = data.metadata
    latest = metadata.versioning[0].latest[0]
  } catch (e) {
    res.status(400).json({
      error: e.message
    })
  }

  try {
    const canv = createCanvas(300, 50)
    const ctx = canv.getContext("2d")
    const template = await loadImage(readFileSync(join(__dirname, "..", "..", "..", "..", "_files", "template.png")))
    registerFont(join(__dirname, "..", "..", "..", "..", "_files", "LibreFranklin-Bold.ttf"), { family: "_LibreFranklin" })

    ctx.drawImage(template, 0, 0)
    ctx.fillStyle = "#ffffff"
    ctx.font = "17.5pt _LibreFranklin"
    ctx.textBaseline = "center"
    ctx.textAlign = "left"
    ctx.fillText("Maven Central", 10, (50 * .75) - 5)
    ctx.textBaseline = "center"
    ctx.textAlign = "right"
    ctx.fillText(latest, 290, (50 * .75) - 5)

    res.writeHead(200, [
      ['Content-Type', 'image/png']
    ])
    res.end(canv.toBuffer())
  } catch (e) {
    res.status(400).json({
      error: e.message
    })
  }
}
