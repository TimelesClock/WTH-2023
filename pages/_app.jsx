import '../styles/globals.css'


function MyApp({ Component, pageProps }) {
  return (
    <div theme-data="">
  <Component {...pageProps} />
  </div>
  )
}

export default MyApp