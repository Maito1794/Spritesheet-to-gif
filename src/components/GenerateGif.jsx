import { useEffect, useState, useRef } from 'react'
import { Container, Row, Alert } from 'reactstrap';
import Tooltip from './Tooltip';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton } from '@mui/material';
import { generateGif } from '../utils/GifGenerator';

function GenerateGifPage({ isPiskelFix }) {
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
    const [bgColor, setBgColor] = useState('#ccc');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark-theme');
    const fileRef = useRef(null);
    const imageRef = useRef(null);
    const htmlBody = document.querySelector('body');
    const htmlTitle = document.querySelector('title');
    htmlBody.className = theme;
    htmlTitle.text = "Sprite Sheet to GIF";

    const tooltipData = `2 fps = 500ms\n3 fps = 333ms\n4 fps = 250ms\n5 fps = 200ms\n6 fps = 167ms
    8 fps = 125ms\n10 fps = 100ms\n12 fps = 83ms\n14 fps = 71ms\n16 fps = 62ms\n20 fps = 50ms\n24 fps = 42ms`;

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
            if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(bgColor)) {
                setShowAlert(true);
                setAlertMessage("Invalid hex color");
                return;
            }
            const gifBlob = await generateGif(spriteSheet, frameWidth, frameHeight, delay, bgColor);
            setGif(URL.createObjectURL(gifBlob));
            console.log('Generated gif:', gifBlob);
            console.log('Generated gif url:', URL.createObjectURL(gifBlob));

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
        a.download = `${imgName}.gif`;
        a.click();
    }

    const handleBgColorChange = (e) => {
        if (e.target.value.length > 7) {
            return;
        }
        if (e.target.value === '' || e.target.value[0] !== '#') {
            setBgColor('#');
            return;
        }
        setBgColor(e.target.value);
    }

    const handlePageChange = () => {
        isPiskelFix(true);
    }

    const handleThemeChange = () => {
        localStorage.setItem('theme', theme === 'dark-theme' ? 'light-theme' : 'dark-theme');
        theme === 'dark-theme' ? setTheme('light-theme') : setTheme('dark-theme');
    }
    return (
        <>
            <Container fluid>
                <Row>
                    <div className="col-md-12 col-sm-12 header d-flex align-items-center justify-content-center gap-2">
                        <h1>Sprite Sheet to GIF</h1>
                        <IconButton className='justify-selc-center' onClick={handleThemeChange}>
                            {theme === 'dark-theme' ? <LightModeOutlinedIcon htmlColor='#fff' /> : <DarkModeOutlinedIcon />}
                        </IconButton>
                    </div>
                </Row>
                <Row>
                    <div className="col-md-12 col-sm-12">
                        <Row>
                            <div className="col-md-3 col-sm-12 mb-3">
                                <label htmlFor="spritesheet" className="form-label">Sprite Sheet (.png, .jpg, .jpeg)</label>
                                <div className="input-group">
                                    <input ref={fileRef} className="form-control" type="file" id="spritesheet" accept="image/png, image/jpg, image/jpeg" onChange={(e) => { handleFileUpload(e) }} />
                                    <div className="input-group-append">
                                        <button type="button" className="btn btn-danger btn-square" onClick={() => { handleDeleteImage() }}>X</button>
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
                                    <Tooltip placement={"right"} data={tooltipData} />
                                </div>
                                <input className="form-control" type="number" id="delay" value={delay} onChange={(e) => { setDelay(e.target.value) }} />
                            </div>
                            <div className="col-md-2 col-sm-12 mb-3">
                                <div className="d-flex align-items-center">
                                    <label htmlFor="bgColor" className="form-label">Hex background color</label>
                                    <Tooltip placement={"top"} data={"Transparent background not yet supported"} />
                                </div>
                                <input className="form-control" type="text" id="bgColor" value={bgColor} onChange={(e) => { handleBgColorChange(e) }} />
                            </div>
                            <div className="col-md-1 col-sm-12 mb-3 align-self-end">
                                <button type="button" className='btn btn-primary' onClick={async () => await handleGenerateGif()}>
                                    Generate
                                </button>
                            </div>
                        </Row>
                        <button type="button" className="btn btn-link" onClick={() => handlePageChange()}>I already have a Piskel-generated GIF</button>
                        <Alert color="danger" className={!showAlert ? 'invisible' : ''} isOpen={true} toggle={() => setShowAlert(false)}>{alertMessage}</Alert>
                        <Row>
                            {spriteSheet &&
                                <div className="col-md-6 col-sm-12 mb-3 d-flex justify-content-center">
                                    <div className="image-container">
                                        <img ref={imageRef} src={spriteSheet} alt="Sprite-Sheet" className="img-fluid" />
                                        <div className="red-rectangle" style={{
                                            border: '2px solid red',
                                            position: 'absolute',
                                            top: '3px',
                                            left: '3px',
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

export default GenerateGifPage