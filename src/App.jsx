import { useEffect, useState, useRef } from 'react'
import { Container, Row, Col, Alert } from 'reactstrap';
import './App.css'
import { generateGif } from './utils/GifGenerator';

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
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  const handleGenerateGif = async () => {
    try {
      if (!spriteSheet) {
        throw new Error("No sprite sheet provided");
      }
      if (!frameWidth || !frameHeight) {
        throw new Error("Frame width and height are required");
      }
      if (!delay) {
        throw new Error("Delay is required");
      }
      const gifBlob = await generateGif(spriteSheet, frameWidth, frameHeight, delay);
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
  }, [spriteSheet, frameWidth, frameHeight, delay]);

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
      if (spriteSheet) {
        imageRef.current.removeEventListener('load', handleImageUpload);
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
              <div className="col-md-4 col-sm-12 mb-3">
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
                <label htmlFor="delay" className="form-label">Delay (ms)</label>
                <input className="form-control" type="number" id="delay" value={delay} onChange={(e) => { setDelay(e.target.value) }} />
              </div>
              <div className="col-md-2 col-sm-12 mb-3 align-self-end">
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