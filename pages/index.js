import Head from "next/head"
import styles from "../styles/Home.module.css"
import { useEffect, useState } from "react"

export default function Home() {
  const [outputText, setOutputText] = useState("")
  const [selections, setSelections] = useState([])
  const [inputContent, setInputContent] = useState("")
  const [infos, setInfos] = useState([])
  const [reader, setReader] = useState({})

  useEffect(() => {
    const reader = new FileReader()
    reader.addEventListener("load", (e) => setInputContent(e.target.result))
    setReader(reader)
    if (window?.localStorage.getItem("selections")) {
      setSelections(JSON.parse(window.localStorage.getItem("selections")))
      console.log("Loaded preferences from browser storage")
    }
  }, [])

  useEffect(() => {
    insertOptions()
    printOutput()
  }, [inputContent])

  const setInfosStorage = (selections) => {
    const selctionsString = JSON.stringify(selections)
    window.localStorage.setItem("selections", selctionsString)
  }

  const dropHandler = (ev) => {
    ev.preventDefault()
    if (ev.dataTransfer.items) {
      ;[...ev.dataTransfer.items].forEach((item, i) => {
        if (item.kind === "file") {
          reader.readAsText(file)
        }
      })
    }
    // dropZone.style["border"] = "5px dashed lightgrey"
  }

  const dragOverHandler = (ev) => {
    dropZone.style["border"] = "5px solid lightgrey"
    ev.preventDefault()
  }

  const dragLeaveHandler = (ev) => {
    dropZone.style["border"] = "5px dashed lightgrey"
    ev.preventDefault()
  }

  const changeHandler = (event) => {
    // setFile()
    // console.log({ file })
    reader.readAsText(event.target?.files?.[0])
  }

  const insertOptions = () => {
    setInfos(
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
      })
    )
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
    const targetID = e.target.id.replace
    setInfosStorage(selections)
    printOutput()
  }

  // const renderOptions = () => {
  //   const infosContainer = document.createElement("div")
  //   infosContainer.id = "infos"
  //   infos.forEach(({ name, before, after }) => {
  //     const container = document.createElement("div")

  //     const beforeText = document.createElement("textarea")
  //     beforeText.id = `before_${name}`
  //     beforeText.style = "width:10%"
  //     beforeText.rows = "1"
  //     beforeText.textContent = before
  //     beforeText.addEventListener("input", handleDelimiterChange)

  //     const afterText = document.createElement("textarea")
  //     afterText.id = `after_${name}`
  //     afterText.style = "width:10%"
  //     afterText.rows = "1"
  //     // console.log(after);
  //     afterText.textContent = after
  //     afterText.addEventListener("input", handleDelimiterChange)

  //     const checkbox = document.createElement("input")
  //     checkbox.type = "checkbox"
  //     checkbox.name = name
  //     checkbox.checked = selections.map((s) => s.name).includes(name)
  //     checkbox.addEventListener("change", (e) => {
  //       if (e.target.checked) {
  //         setSelections(
  //           selections.map((s) => s.name).includes(name)
  //             ? selections.filter((s) => s.name !== name)
  //             : [...selections, { name, after: "", before: "" }]
  //         )
  //       } else {
  //         setSelections(selections.filter((s) => s.name !== name))
  //       }
  //       // console.log(selections);
  //       if (inputContent) {
  //         setInfosStorage(selections)
  //         printOutput(inputContent, selections)
  //       }
  //     })
  //     const label = document.createElement("label")
  //     label.textContent = name
  //     container.appendChild(beforeText)
  //     container.appendChild(checkbox)
  //     container.appendChild(label)
  //     infosContainer.appendChild(container)
  //     container.appendChild(afterText)
  //   })
  //   // result.insertBefore(infosContainer, output)
  // }

  const printOutput = () => {
    const lines = inputContent
      .split("\n")
      .map((line) =>
        line
          .replace(/\t\t\t/g, "\tempty\tempty\t ")
          .replace(/\t\t/g, "\tempty\t")
      )
      .filter((line, i) => i !== 0 && line !== "")
    const columns = selections.map(({ name, before, after }) =>
      lines.map((line) => ({
        value: [...line.matchAll(/[^\t|\n]+/g)]?.[
          infos.map((i) => i.name).indexOf(name)
        ]?.[0],
        before,
        after,
      }))
    )
    console.log({ columns })

    for (let trackIndex = 0; trackIndex < columns[0]?.length; trackIndex++) {
      let track = ""
      for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
        track = columns
          .map(
            (col) =>
              `${col[trackIndex].before}${col[trackIndex].value}${col[trackIndex].after}`
          )
          .join("")
      }
      setOutputText(`${outputText}${track}\n`)
    }
    // output.width = "100%"
    // output.rows = lines.length + 1
  }
  const copyClickHandler = () => {
    if (document.selection) {
      const range = document.body.createTextRange()
      range.moveToElementText(output)
      range.select().createTextRange()
      document.execCommand("copy")
    } else if (window.getSelection) {
      const range = document.createRange()
      range.selectNode(output)
      window.getSelection().addRange(range)
      document.execCommand("copy")
      alert(`Output for ${lines.length + 1} tracks copied to clipboard.`)
    }
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
          onDrop={dropHandler}
          onDragOver={dragOverHandler}
          onDragLeave={dragLeaveHandler}
        >
          <p>
            Drag a
            <img
              loading='lazy'
              decoding='async'
              src='https://rekordbox.com/wp-content/themes/rekordbox/assets/img/2022/common/logo/rekordbox.svg'
              alt='rekordbox'
              width='90'
              height='13'
            />
            playlist .txt file <i>here</i> or attach a file.{" "}
            <input type='file' id='input' onChange={changeHandler} />
          </p>
        </div>
        <div>
          {infos?.map(({ name, before, after }) => (
            <div>
              <textarea value={before} onChange={handleDelimiterChange} />
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
                  // console.log(selections);
                  if (inputContent) {
                    setInfosStorage(selections)
                    printOutput(inputContent, selections)
                  }
                }}
              />
              <label>{name}</label>
              <textarea value={after} onChange={handleDelimiterChange} />
            </div>
          ))}
        </div>
        <div className={styles.result}>
          <textarea value={outputText} width='100%' />
          <button onClick={copyClickHandler}>Copy 📋</button>
        </div>
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
