import { useState } from 'react'
import GenerateGif from './components/GenerateGif'
import FixPiskelGif from './components/FixPiskelGif'
import './App.css'

function App() {
  const [isPiskel, setIsPiskel] = useState(false)
  const isPiskelFix = (bool) => {
    console.log('isPiskelFix', bool)
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
