import { useEffect, useState, useRef } from 'react'
import { Container, Row, Alert } from 'reactstrap';
import { generateGif } from './utils/GifGenerator';
import Tooltip from './components/Tooltip';
import './App.css'

function App() {
  const [spriteSheet, setSpriteSheet] = useState('');
  const [frameWidth, setFrameWidth] = useState(210);
  const [frameHeight, setFrameHeight] = useState(210);
  const [delay, setDelay] = useState(125);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('no error message');
  const [gif, setGif] = useState(null);
  const [rectangleWidth, setRectangleWidth] = useState(0);
  const [rectangleHeight, setRectangleHeight] = useState(0);
  const [imgName, setImgName] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  const tooltipData = {
    placement: "right",
    data: `2 fps = 500ms\n3 fps = 333ms\n4 fps = 250ms\n5 fps = 200ms\n6 fps = 167ms
    8 fps = 125ms\n10 fps = 100ms\n12 fps = 83ms\n14 fps = 71ms\n16 fps = 62ms\n20 fps = 50ms\n24 fps = 42ms`
  }

  const handleGenerateGif = async () => {
    try {
      if (!spriteSheet) {
        setShowAlert(true);
        setAlertMessage("No sprite sheet provided");
        return;
      }
      if (!frameWidth || !frameHeight) {
        setShowAlert(true);
        setAlertMessage("Frame width and height are required");
        return;
      }
      if (!delay) {
        setShowAlert(true);
        setAlertMessage("Delay is required");
        return;
      }
      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(bgColor) && bgColor !== '') {
        setShowAlert(true);
        setAlertMessage("Invalid hex color");
        return;
      }
      const gifBlob = await generateGif(spriteSheet, frameWidth, frameHeight, delay, bgColor);
      setGif(URL.createObjectURL(gifBlob));

    } catch (error) {
      setShowAlert(true);
      setAlertMessage("Internal error occurred. Please try again.");
      console.error("Error generating GIF:", error);
    }
  }

  useEffect(() => {
    setAlertMessage('no error message');
    setShowAlert(false);
  }, [spriteSheet, frameWidth, frameHeight, delay, bgColor]);

  useEffect(() => {
    const handleImageUpload = () => {
      const width = frameWidth * imageRef.current.width / imageRef.current.naturalWidth;
      const height = frameHeight * imageRef.current.height / imageRef.current.naturalHeight;
      setRectangleWidth(width);
      setRectangleHeight(height);
    };

    const handleWindowResize = () => {
      handleImageUpload();
    };

    if (spriteSheet) {
      imageRef.current.addEventListener('load', handleImageUpload);
      window.addEventListener('resize', handleWindowResize);
      handleImageUpload();
    }

    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener('load', handleImageUpload);
      }
      if (spriteSheet) {
        window.removeEventListener('resize', handleWindowResize);
      }
    };
  }, [spriteSheet, frameWidth, frameHeight]);


  const handleDeleteImage = () => {
    fileRef.current.value = '';
    setSpriteSheet('');
    setGif(null);
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const fileName = file.name.split('.')[0];
    const fileExtension = file.name.split('.')[1];
    if (fileExtension !== 'png' && fileExtension !== 'jpg' && fileExtension !== 'jpeg') {
      setShowAlert(true);
      setAlertMessage("Invalid file type. Please upload a .png, .jpg, or .jpeg file");
      return;
    }
    if (!file) {
      return;
    }
    setImgName(fileName);
    setSpriteSheet(URL.createObjectURL(file));
  }

  const handleDowloadGif = () => {
    const a = document.createElement('a');
    a.href = gif;
    a.target = '_blank';
    a.download = `${imgName}.gif`;
    a.click();
  }

  return (
    <>
      <Container fluid>
        <h1 className="header">Sprite Sheet to GIF</h1>
        <Row>
          <div className="col-md-12 col-sm-12">
            <Row>
              <div className="col-md-3 col-sm-12 mb-3">
                <label htmlFor="spritesheet" className="form-label">Sprite Sheet (.png, .jpg, .jpeg)</label>
                <div className="input-group">
                  <input ref={fileRef} className="form-control" type="file" id="spritesheet" accept="image/png, image/jpg, image/jpeg" onChange={(e) => { handleFileUpload(e) }} />
                  <div className="input-group-append">
                    <button type="button" className="btn btn-outline-danger btn-square" onClick={() => { handleDeleteImage() }}>X</button>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-sm-12 mb-3">
                <label htmlFor="height" className="form-label">Frame Height (px)</label>
                <input className="form-control" type="number" id="height" value={frameHeight} onChange={(e) => { setFrameHeight(e.target.value) }} />
              </div>
              <div className="col-md-2 col-sm-12 mb-3">
                <label htmlFor="width" className="form-label">Frame Width (px)</label>
                <input className="form-control" type="number" id="width" value={frameWidth} onChange={(e) => { setFrameWidth(e.target.value) }} />
              </div>
              <div className="col-md-2 col-sm-12 mb-3">
                <div className="d-flex align-items-center">
                  <label htmlFor="delay" className="form-label mr-2">Delay (ms)</label>
                  <Tooltip placement={tooltipData.placement} data={tooltipData.data} />
                </div>
                <input className="form-control" type="number" id="delay" value={delay} onChange={(e) => { setDelay(e.target.value) }} />
              </div>
              <div className="col-md-2 col-sm-12 mb-3">
                <label htmlFor="bgColor" className="form-label">Hex background color</label>
                <input className="form-control" type="text" id="bgColor" value={bgColor} onChange={(e) => { setBgColor(e.target.value) }} />
              </div>
              <div className="col-md-1 col-sm-12 mb-3 align-self-end">
                <button type="button" className='btn btn-primary' onClick={async () => await handleGenerateGif()}>
                  Generate
                </button>
              </div>
            </Row>
            <Alert color="danger" className={!showAlert ? 'invisible' : ''} isOpen={true} toggle={() => setShowAlert(false)}>{alertMessage}</Alert>
            <Row>
              {spriteSheet &&
                <div className="col-md-6 col-sm-12 mb-3 d-flex justify-content-center">
                  <div className="image-container">
                    <img ref={imageRef} src={spriteSheet} alt="Sprite-Sheet" className="img-fluid" />
                    <div className="red-rectangle" style={{
                      border: '1px solid red',
                      position: 'absolute',
                      top: 1,
                      left: 1,
                      width: `${rectangleWidth}px`,
                      height: `${rectangleHeight}px`
                    }}></div>
                  </div>
                </div>

              }
              {gif &&

                <div className="col-md-6 col-sm-12 mb-3 d-flex flex-column align-items-center">
                  <div className="image-container">
                    <img src={gif} alt="generated-gif" className="img-fluid" />
                  </div>
                  <button type="button" className="btn btn-success mt-3" onClick={() => { handleDowloadGif() }}>Download</button>
                </div>
              }
            </Row>
          </div>
        </Row>
      </Container>
    </>
  )
}

export default App
