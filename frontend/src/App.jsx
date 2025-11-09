import { useState } from 'react'
import './App.css'
import UploadVideo from './components/get_video'
import Header from './components/Header'

function App() {
  

  return (
    <div>
      <Header/>
      <UploadVideo/>
    </div>
  )
}

export default App
