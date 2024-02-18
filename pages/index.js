import Head from "next/head"
import styles from "../styles/Home.module.css"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  const [reader, setReader] = useState({})
  const [inputContent, setInputContent] = useState("")
  const [options, setOptions] = useState([])
  const [selections, setSelections] = useState([])
  const [outputText, setOutputText] = useState("")
  const dropZoneRef = useRef(null)

  useEffect(() => {
    const reader = new FileReader()
    reader.addEventListener("load", (e) => setInputContent(e.target.result))
    setReader(reader)
    if (window?.localStorage.getItem("selections")) {
      setSelections(JSON.parse(window.localStorage.getItem("selections")))
      console.log(
        `Loaded ${selections.length} preferences from browser storage`
      )
    }
  }, [])

  useEffect(() => {
    setOptions(
      [
        ...inputContent
          .split("\n")
          .shift()
          .matchAll(/(.+?)(?:\t|\n)/g),
      ].map((match) => {
        const infoFromStorage = selections.find(
          (sel) => sel.name === match?.[0].replace("\t", "")
        )
        return {
          name: match?.[0].replace("\t", ""),
          before: infoFromStorage?.before || "",
          after: infoFromStorage?.after || "",
        }
      }),
      printOutput()
    )
  }, [inputContent])

  useEffect(() => {
    setoptionsStorage(selections)
    printOutput()
  }, [selections])

  const setoptionsStorage = (selections) => {
    const selectionsString = JSON.stringify(selections)
    window.localStorage.setItem("selections", selectionsString)
  }

  const changeHandler = (event) => {
    reader.readAsText(event.target?.files?.[0])
  }

  const handleDelimiterChange = (e) => {
    setSelections(
      selections.map((selection) => {
        if (e.target.id.includes(selection.name)) {
          if (e.target.id.includes("before")) {
            selection.before = e.target.value
          }
          if (e.target.id.includes("after")) {
            selection.after = e.target.value
          }
        }
        return selection
      })
    )
    setoptionsStorage(selections)
    printOutput()
  }

  const printOutput = () => {
    console.log("printOutput()")
    const lines = inputContent
      .split("\n")
      .map((line) =>
        line
          .replace(/\t\t\t/g, "\tempty\tempty\t ")
          .replace(/\t\t/g, "\tempty\t")
      )
      .filter((line, i) => i !== 0 && line !== "")

    // console.log({ lines })
    // console.log({ options })
    const columns = selections.map(({ name, before, after }) =>
      lines.map((line) => ({
        name: [...line.matchAll(/[^\t|\n]+/g)]?.[
          options.map((i) => i.name).indexOf(name)
        ]?.[0],
        before,
        after,
      }))
    )
    // console.log({ columns })
    const tracks = []
    for (let trackIndex = 0; trackIndex < columns[0]?.length; trackIndex++) {
      tracks.push(
        columns
          .map(
            (col) =>
              `${col[trackIndex].before}${col[trackIndex].name}${col[trackIndex].after}`
          )
          .join("")
      )
    }
    // console.log({ tracks })
    setOutputText(tracks.join("\n"))
  }
  const copyClickHandler = () => {
    // if (document.selection) {
    //   const range = document.body.createTextRange()
    //   range.moveToElementText(output)
    //   range.select().createTextRange()
    //   document.execCommand("copy")
    // } else if (window.getSelection) {
    //   const range = document.createRange()
    //   range.selectNode(output)
    //   window.getSelection().addRange(range)
    //   document.execCommand("copy")
    //   alert(`Output for ${lines.length + 1} tracks copied to clipboard.`)
    // }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Track ID Me!</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <div
          className={styles.dropZone}
          id='drop_zone'
          ref={dropZoneRef}
          style={
            outputText
              ? {}
              : {
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }
          }
          onDrop={(e) => {
            e.preventDefault()
            if (e.dataTransfer.items) {
              ;[...e.dataTransfer.items].forEach((item) => {
                const file = item.getAsFile()
                if (item.kind === "file") {
                  reader.readAsText(file)
                }
              })
            }
            dropZoneRef.current.style["border"] = "5px dashed lightgrey"
          }}
          onDragOver={(e) => {
            e.preventDefault()
            dropZoneRef.current.style["border"] = "5px solid lightgrey"
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            dropZoneRef.current.style["border"] = "5px dashed lightgrey"
          }}
        >
          <p className={styles.manual}>
            Drag a
            <img
              src='https://rekordbox.com/wp-content/themes/rekordbox/assets/img/2022/common/logo/rekordbox.svg'
              alt='rekordbox'
              width='90'
              height='13'
              className={styles.rekordbox}
            />
            playlist .txt file <i>here</i> or attach a file.
            <input type='file' id='input' onChange={changeHandler} />
          </p>
        </div>
        <div>
          {options?.map(({ name, before, after }, index) => (
            <div key={`${index} ${name}`}>
              <textarea
                id={`before_${name}`}
                defaultValue={before}
                onChange={handleDelimiterChange}
                rows={1}
                cols={3}
              />
              <input
                id={name}
                type='checkbox'
                checked={selections.map((s) => s.name).includes(name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelections(
                      selections.map((s) => s.name).includes(name)
                        ? selections.filter((s) => s.name !== name)
                        : [...selections, { name, after: "", before: "" }]
                    )
                  } else {
                    setSelections(selections.filter((s) => s.name !== name))
                  }
                }}
              />
              <label>{name}</label>
              <textarea
                id={`after_${name}`}
                defaultValue={after}
                onChange={handleDelimiterChange}
                rows={1}
                cols={3}
              />
            </div>
          ))}
        </div>
        {outputText ? (
          <div className={styles.result}>
            <textarea
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              rows={outputText.split(/\n/).length + 1}
              cols={outputText
                .split(/\n/)
                .reduce((a, b) => (a.length > b.length ? a.length : b.length))}
            />
            <button onClick={copyClickHandler}>Copy 📋</button>
          </div>
        ) : null}
      </main>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
