// this is my mangled version of FileUploadForm for loading just one local Audio file
// without saving it to the backend

import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { Button, Box, Input, Typography } from "@mui/material";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import CloseIcon from "@mui/icons-material/Close";

import { setAudioPlayerFile } from "../../features/projects/SingleProjectSlice";

const FileUploadForm = (props) => {
  const { projectId, userId, handleClose } = props;

  const [name, setName] = useState("");
  const [file, setFile] = useState({});

  const doneOne = React.useRef(false)

  const dispatch = useDispatch();

  const fileInputRef = React.useRef()

  const handleFormSubmit = async (e) => {

    e.preventDefault();

    const audioPlayer = document.getElementById('audioPlayer')
    if ( audioPlayer) {
        audioPlayer.src = URL.createObjectURL(file)
        audioPlayer.load()
        audioPlayer.addTextTrack("metadata",file.name)
        dispatch(setAudioPlayerFile(file.name))
    }

    setName("");
    setFile({});
    handleClose();
  };

  React.useEffect( ()=> {
    
    if (fileInputRef.current && !doneOne.current) {
        doneOne.current = true
        //console.log('files:',fileInputRef)
        //console.log(document.getElementById('filePath'))
        document.getElementById('filePath').click()
        fileInputRef.current.click()
    }
  },[fileInputRef.current,doneOne])

  return (
    <form onSubmit={handleFormSubmit}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Button
          size="small"
          color="error"
          onClick={handleClose}
          sx={{ alignSelf: "flex-end" }}
        >
          <CloseIcon />
        </Button>

        <div>Choose a file</div>
        <Box>
          <Button
            color={file && file.name ? "success" : "error"}
            sx={{ margin: "5px" }}
          >
            <label htmlFor="filePath">
              <DriveFolderUploadIcon fontSize="large" />
            </label>
          </Button>
          {file && file.name ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {file.name}
            </Box>
          ) : null}

          <Input
            id="filePath"
            ref={fileInputRef}
            type="file"
            accept="audio/*" /*  ".ogg, .mp3" */
            name="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
            sx={{ display: "none" }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          sx={{ alignSelf: "flex-end" }}
          disabled={!file.name}
        >
          <Typography>Done</Typography>
        </Button>

      </Box>
    </form>
  );
};

export default FileUploadForm;
