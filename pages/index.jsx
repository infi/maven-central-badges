import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  const [packageName, setPackageName] = useState("")
  const [error, setError] = useState("")
  const [dataUrl, setDataUrl] = useState("")
  const [markdown, setMarkdown] = useState("")

  const reset = () => {
    setDataUrl("")
  }

  const checkPackageForEnter = (e) => {
    setDataUrl("")
    if (e.key === "Enter")
      performSearch()
  }

  const performSearch = async () => {
    setError("")
    const response = await fetch(`/api/badge?for=${packageName}`)
    const isError = response.headers.get("content-type").startsWith("application/json")

    if (isError) {
      const json = await response.json()
      setError(json.error)
    } else {
      const img = await response.blob()
      const reader = new FileReader()
      reader.onload = e => setDataUrl(e.target.result)
      reader.readAsDataURL(img)

      if (!process.browser) return

      setMarkdown(`![Current Version on Maven Central](${window.location.protocol}//${window.location.host}/api/badge?for=${packageName})`)
    }
  }

  return (
    <div className="home">
      <Head>
        <title>Maven Central Badges</title>
      </Head>
      <div>
        <div className="contents">
          <h1>Maven Central Badges</h1>
          <p>This microservice can generate a badge for the latest version of a Maven Central project.</p>
          <p>Originally created for <a
            href="https://github.com/jrvlt/jrv"
            target="_blank"
            referrerPolicy="no-referrer">The Java Revolt Bridge</a>.</p>
        </div>
        <div className="contents">
          <h1>Try it out</h1>
          <input
            type="text"
            placeholder="Package, e.g. ga.geist.jrv"
            onChange={reset}
            onKeyPress={checkPackageForEnter}
            value={packageName}
            onInput={x => setPackageName(x.target.value)}
          />
          {error.length > 0 && <div class="error">{error}</div>}
          {dataUrl.length > 0 && <>
            <img src={dataUrl} />
            <h3>Markdown</h3>
            {!!process.browser && <pre><code>{markdown}</code></pre>}
          </>}
        </div>
      </div>
    </div>
  )
}
