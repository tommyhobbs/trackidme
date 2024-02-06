import Head from "next/head"
import styles from "../styles/Home.module.css"

export default function Home() {
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
          ondrop='dropHandler(event);'
          ondragover='dragOverHandler(event);'
          ondragleave='dragLeaveHandler(event);'
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
            <input type='file' id='input' />
          </p>
        </div>
        <div id='result' className={styles.result} />
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
