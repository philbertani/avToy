import * as React from "react";
import { useDispatch } from "react-redux";

import { Box } from "@mui/material";

import SectionColumn from "./SectionColumn";
import SingleSectionView from "./SingleSectionView";
import AddNewSection from "./AddNewSection";

import { deleteSectionAsync } from "../../features";

import PlayAll from "./PlayAll";
import { GPU } from "./GPU/GPU";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import { setFinished } from "../../features/projects/playAllSlice";

export default function Sections({
  sections,
  userId,
  projectId,
  graphicsFn,
  final,
}) {
  const [singleSection, setSingleSection] = React.useState(false);
  const [singleSectionRender, setSingleSectionRender] = React.useState(false);
  const [selectedSectionId, setSelectedSectionId] = React.useState(1);
  const [selectedSection, setSelectedSection] = React.useState({});
  const [assignSectionFormActive, setAssignSectionFormActive] =
    React.useState(false);

  React.useEffect(() => {
    if (singleSection) {
      setSelectedSection(sections.filter((x) => x.id === selectedSectionId)[0]);
    } else {
      setSelectedSection({});
    }
  }, [sections, singleSection, selectedSectionId, setSelectedSection]);

  React.useEffect(() => {
    if (singleSection & (Object.keys(selectedSection).length > 0)) {
      setSingleSectionRender(true);
    } else {
      setSingleSectionRender(false);
    }
  }, [singleSection, selectedSection]);

  const dispatch = useDispatch();
  const handleDeleteSection = (sectionId) => {
    dispatch(deleteSectionAsync(sectionId));
    // if you delete the section on the single section page
    // then move back to multi section
    if (singleSection) setSingleSection(false);
  };

  const togglePreviewOnClick = (singleSection, sectionId) => {
    if (singleSection) {
      console.log('dispatching setFinished')
      dispatch(setFinished(true))
      setSingleSection(false);
    } else {
      setSelectedSectionId(sectionId);
      setSingleSection(true);
    }
  };

  const [canvasInitialized, setCanvasInitialized] = React.useState(false);
  const [playAllGPUconfig, setPlayAllGPUconfig] = React.useState({});
  const playAllCanvasRef = React.useRef();
  const audioPlayerRef = React.useRef();

  const acRefs = React.useRef(Array(25).fill(null));

  /* GPU() and PlayAll() are React hooks for managing Graphics */
  GPU({
    GPUconfig: playAllGPUconfig,
    gpuDivRef: playAllCanvasRef.current,
    canvasInitialized,
    setCanvasInitialized,
  });

  PlayAll();

  let canvasStyle, audioStyle;
  if (final) {
    canvasStyle = { position: "relative", top: "7vh" };
  } else {
    canvasStyle = { 
      position: "relative", left: "max(13.5vw,145px)",marginBottom:"0",
      width:"84vw", height:"80vh", transform:"translate(0,-40px)" };
    audioStyle = {
      position: "relative", top:"0", left: "max(20.5vw,170px)" , width: "70vw",
      marginTop:"0", transform:"translate(0,-40px)" }
    
  }

  return ([
    <div
      key="playAllCanvas"
      id="playAllCanvas"
      ref={playAllCanvasRef}
      style={canvasStyle}
     /*  className="hidden" */
    >
    </div>,
 
    <audio key="audioPlayer" style={audioStyle} ref={audioPlayerRef} id="audioPlayer" controls></audio>
  
  ])
}
