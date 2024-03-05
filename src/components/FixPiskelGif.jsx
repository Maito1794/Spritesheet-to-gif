import { useEffect, useState, useRef } from 'react'
import { Container, Row, Alert } from 'reactstrap';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton } from '@mui/material';
import { FixGif } from '../utils/FixGif';
import Tooltip from './Tooltip';

function FixPiskelGif({ isPiskelFix }) {
    const [gif, setGif] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('no error message');
    const [fixedGif, setFixedGif] = useState(null);
    const [gifName, setGifName] = useState('');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark-theme');
    const fileRef = useRef(null);
    const imageRef = useRef(null);
    const htmlBody = document.querySelector('body');
    const htmlTitle = document.querySelector('title');
    htmlBody.className = theme;
    htmlTitle.text = "Fix piskel GIF";

    const handleFixGif = async () => {
        try {
            if (!gif) {
                setShowAlert(true);
                setAlertMessage("No gif provided");
                return;
            }

            const response = await fetch(gif);
            if (!response.ok) {
                throw new Error('Failed to fetch gif');
            }
            const blob = await response.blob();

            const fixedBlob = await FixGif(blob);
            setFixedGif(URL.createObjectURL(fixedBlob));
        } catch (error) {
            setShowAlert(true);
            setAlertMessage("Internal error occurred. Please try again.");
            console.error("Error fixing GIF:", error);
        }
    }


    useEffect(() => {
        setAlertMessage('no error message');
        setShowAlert(false);
    }, [gif]);


    const handleDeleteImage = () => {
        fileRef.current.value = '';
        setGif('');
        setFixedGif(null);
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const fileName = file.name.split('.')[0];
        const fileExtension = file.name.split('.')[1];
        if (fileExtension !== 'gif') {
            setShowAlert(true);
            setAlertMessage("Invalid file type. Please upload a .gif file");
            return;
        }
        if (!file) {
            return;
        }
        setGifName(fileName);
        setGif(URL.createObjectURL(file));
    }

    const handleDowloadGif = () => {
        const a = document.createElement('a');
        a.href = fixedGif;
        a.download = `${gifName}.gif`;
        a.click();
    }

    const handlePageChange = () => {
        isPiskelFix(false);
    }

    const handleThemeChange = () => {
        console.log('theme change');
        localStorage.setItem('theme', theme === 'dark-theme' ? 'light-theme' : 'dark-theme');
        theme === 'dark-theme' ? setTheme('light-theme') : setTheme('dark-theme');
    }

    return (
        <>
            <Container fluid>
                <Row>
                    <div className="col-md-12 col-sm-12 header d-flex align-items-center justify-content-center gap-2">
                        <h1>Fix Piskel GIF</h1>
                        <IconButton className='justify-selc-center' onClick={handleThemeChange}>
                            {theme === 'dark-theme' ? <LightModeOutlinedIcon htmlColor='#fff' /> : <DarkModeOutlinedIcon />}
                        </IconButton>
                    </div>
                </Row>
                <Row>
                    <div className="col-md-12 col-sm-12">
                        <Row>
                            <div className="col-md-3 col-sm-12 mb-3">
                                <div className="d-flex align-items-center">
                                    <label htmlFor="gif" className="form-label">GIF</label>
                                    <Tooltip placement={"right"} data={"The code for fixing the GIFs is courtesy of Myndzi"} type={"info"} />
                                </div>
                                <div className="input-group">
                                    <input ref={fileRef} className="form-control" type="file" id="gif" accept="image/gif" onChange={(e) => { handleFileUpload(e) }} />
                                    <div className="input-group-append">
                                        <button type="button" className="btn btn-danger btn-square" onClick={() => { handleDeleteImage() }}>X</button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-1 col-sm-12 mb-3 align-self-end">
                                <button type="button" className='btn btn-primary' onClick={async () => await handleFixGif()}>
                                    Generate
                                </button>
                            </div>
                        </Row>
                        <button type="button" className="btn btn-link" onClick={() => handlePageChange()}>Return to Sprite Sheet to GIF</button>
                        <Alert color="danger" className={!showAlert ? 'invisible' : ''} isOpen={true} toggle={() => setShowAlert(false)}>{alertMessage}</Alert>
                        <Row>
                            {gif &&
                                <div className="col-md-6 col-sm-12 mb-3 d-flex justify-content-center">
                                    <div className="image-container">
                                        <img ref={imageRef} src={gif} alt="Sprite-Sheet" className="img-fluid" />
                                    </div>
                                </div>

                            }
                            {fixedGif &&
                                <div className="col-md-6 col-sm-12 mb-3 d-flex flex-column align-items-center">
                                    <div className="image-container">
                                        <img src={fixedGif} alt="generated-gif" className="img-fluid" />
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

export default FixPiskelGif;
