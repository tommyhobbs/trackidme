import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useRef, useState } from 'react'

const CANVAS_SIZE = 1000

export default function Home() {
  const [reader, setReader] = useState({})
  const [bgImgReader, setBgImgReader] = useState({})
  const [inputContent, setInputContent] = useState('')
  const [inputFileName, setInputFileName] = useState('temp.png')
  const [bgImg, setBgImg] = useState(null)
  const [options, setOptions] = useState([])
  const [selections, setSelections] = useState([])
  const [outputText, setOutputText] = useState('')
  const dropZoneRef = useRef(null)
  const canvasRef = useRef(null)
  const [fontSize, setFontSize] = useState('16px')
  const [fontColor, setFontColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')

  useEffect(() => {
    const reader = new FileReader()
    reader.addEventListener('load', (e) => {
      setInputContent(e.target.result)
      setOptions(
        [
          ...e.target.result
            .split('\n')
            .shift()
            .matchAll(/(.+?)(?:\t|\n)/g),
        ].map((match) => {
          console.log({ match })
          const infoFromStorage = selections.find(
            (sel) => sel.name === match?.[0].replace('\t', '')
          )
          return {
            name: match?.[0].replace('\t', ''),
            after: infoFromStorage?.after || '',
          }
        })
      )
    })
    setReader(reader)

    const bgReader = new FileReader()
    bgReader.addEventListener('load', (e) => {
      let img = new Image()
      img.onload = () => {
        img.width = '400px'
        img.height = '400px'
        console.log({ img })
        canvasRef?.current?.canvas?.getContext('2d')?.drawImage(img, 0, 0)
      }
      img.src = e.target.result
      setBgImg(img)
    })
    setBgImgReader(bgReader)

    if (window?.localStorage.getItem('selections')) {
      setSelections(JSON.parse(window.localStorage.getItem('selections')))
      console.log(
        `Loaded ${selections.length} preferences from browser storage`
      )
    }
  }, [])

  useEffect(() => {
    setOptions(
      [
        ...inputContent
          .split('\n')
          .shift()
          .matchAll(/(.+?)(?:\t|\n)/g),
      ].map((match) => {
        const infoFromStorage = selections.find(
          (sel) => sel.name === match?.[0].replace('\t', '')
        )
        return {
          name: match?.[0].replace('\t', ''),
          after: infoFromStorage?.after || '',
        }
      })
    )
    printOutput()
  }, [inputContent])

  useEffect(() => {
    setSelectionsStorage(selections)
    printOutput()
  }, [selections])

  useEffect(() => {
    draw()
  }, [fontSize, fontColor, bgColor])

  const setSelectionsStorage = (selections) => {
    const selectionsString = JSON.stringify(selections)
    window.localStorage.setItem('selections', selectionsString)
  }

  const changeHandler = (event) => {
    reader.readAsText(event.target?.files?.[0])
    setInputFileName(event.target?.files?.[0]?.name)
  }

  const handleDelimiterChange = (e) => {
    setSelections(
      selections.map((selection) => {
        if (e.target.id.includes(selection.name)) {
          if (e.target.id.includes('before')) {
            selection.before = e.target.value
          }
          if (e.target.id.includes('after')) {
            selection.after = e.target.value
          }
        }
        return selection
      })
    )
    setSelectionsStorage(selections)
    printOutput()
  }

  const printOutput = () => {
    const lines = inputContent
      .split('\n')
      .map((line) =>
        line
          .replace(/\t\t\t/g, '\tempty\tempty\t ')
          .replace(/\t\t/g, '\tempty\t')
      )
      .filter((line, i) => i !== 0 && line !== '')

    const columns = selections.map(({ name, before, after }) =>
      lines.map((line) => ({
        name: [...line.matchAll(/[^\t|\n]+/g)]?.[
          options.map((i) => i.name).indexOf(name)
        ]?.[0],
        before,
        after,
      }))
    )
    const tracks = []
    for (let trackIndex = 0; trackIndex < columns[0]?.length; trackIndex++) {
      tracks.push(
        columns
          .map(
            (col) =>
              `${col[trackIndex].before}${col[trackIndex].name}${col[trackIndex].after}`
          )
          .join('')
      )
    }
    setOutputText(tracks.join('\n'))
  }
  const copyClickHandler = async () => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(outputText)
    } else {
      document.execCommand('copy', true, outputText)
    }
    alert(
      `Output for ${
        outputText.split('\n').length + 1
      } tracks copied to clipboard.`
    )
  }

  const draw = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      bgImg && ctx.drawImage(bgImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
      const lines = outputText.split('\n')
      const lineHeight = CANVAS_SIZE / lines.length
      ctx.font = `${fontSize} serif`
      ctx.fillStyle = fontColor
      outputText.split('\n').map((line, index) => {
        ctx.fillText(
          line,
          10,
          index * lineHeight + Number(fontSize.replace('px', '')),
          CANVAS_SIZE
        )
      })
    }
  }

  draw()
  return (
    <div className={styles.container}>
      <Head>
        <title>Track ID Me!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div
          className={styles.dropZone}
          id="drop_zone"
          ref={dropZoneRef}
          style={
            inputContent
              ? {}
              : {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                }
          }
          onDrop={(e) => {
            e.preventDefault()
            if (e.dataTransfer.items) {
              ;[...e.dataTransfer.items].forEach((item) => {
                const file = item.getAsFile()
                if (item.kind === 'file') {
                  reader.readAsText(file)
                }
              })
            }
            dropZoneRef.current.style['border'] = '5px dashed lightgrey'
          }}
          onDragOver={(e) => {
            e.preventDefault()
            dropZoneRef.current.style['border'] = '5px solid lightgrey'
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            dropZoneRef.current.style['border'] = '5px dashed lightgrey'
          }}
        >
          <p className={styles.manual}>
            Drag a
            <img
              src="https://rekordbox.com/wp-content/themes/rekordbox/assets/img/2022/common/logo/rekordbox.svg"
              alt="rekordbox"
              width="90"
              height="13"
              className={styles.rekordbox}
            />
            playlist .txt file <i>here</i> or attach a file.
            <input
              type="file"
              id="input"
              accept=".txt"
              onChange={changeHandler}
            />
          </p>
        </div>
        <div>
          {options?.map(({ name, after }, index) => (
            <span key={`${index} ${name}`}>
              <input
                id={name}
                type="checkbox"
                checked={selections.map((s) => s.name).includes(name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelections(
                      selections.map((s) => s.name).includes(name)
                        ? selections.filter((s) => s.name !== name)
                        : [...selections, { name, after: '', before: '' }]
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
            </span>
          ))}
        </div>
        {inputContent ? (
          <div>
            <div className={styles.result}>
              <textarea
                defaultValue={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                rows={outputText.split(/\n/).length}
                style={{ width: '100%' }}
              />
            </div>
            <button onClick={copyClickHandler}>
              Copy Text to Clipboard 📋
            </button>
            <label htmlFor="fontsize">Font size (px): </label>
            <input
              id="fontsize"
              type="number"
              defaultValue={Number(fontSize.replace('px', ''))}
              onChange={(e) => setFontSize(`${e.target.value}px`)}
              style={{ width: '45px' }}
            />
            <span>
              <label for="fontColor">Font Colour</label>
              <input
                type="color"
                id="fontColor"
                name="head"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
              />
            </span>
            <span>
              <label for="bgColor">Background Colour</label>
              <input
                type="color"
                id="bgColor"
                name="head"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </span>
            <label htmlFor="bgImg">Background Image:</label>
            <input
              type="file"
              id="bgImg"
              accept=".jpg,.png"
              onChange={(event) => {
                bgImgReader.readAsDataURL(event.target?.files?.[0])
              }}
            />
            <a
              download={inputFileName?.replace('.txt', '.png')}
              href={canvasRef?.current?.toDataURL('image/png')}
            >
              Save as Image 🖼️
            </a>
            <canvas
              width={1000}
              height={1000}
              ref={canvasRef}
              className={styles.canvas}
            ></canvas>
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
