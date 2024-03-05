import { useState } from 'react'
import GenerateGif from './components/GenerateGif'
import FixPiskelGif from './components/FixPiskelGif'
import './App.css'

function App() {
  const [isPiskel, setIsPiskel] = useState(sessionStorage.getItem('isPiskel') || false)
  const isPiskelFix = (bool) => {
    sessionStorage.setItem('isPiskel', bool)
    setIsPiskel(bool)
  }

  return (
    <>
      {!isPiskel ?
        <GenerateGif isPiskelFix={isPiskelFix} />
        :
        <FixPiskelGif isPiskelFix={isPiskelFix} />
      }

    </>
  )

}

export default App
