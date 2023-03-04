import * as React from "react"
import * as THREE from "three"
import { createShaderModel,animateShaderModel} from "./graphicsFunctions" 
import { graphicsOptions } from "./graphicsOptions"
import {useSelector, useDispatch} from "react-redux"
import {setFinished} from "../../../features/projects/playAllSlice"

import AudioContextPlus from "../../../audio"

import { grInit, renderGR} from "./d12GodRays"

//gpuDivRef was passed in as:  gpuDivRef.current in order to satisfy the dependencies array
export function GPU( {GPUconfig,gpuDivRef,canvasInitialized,setCanvasInitialized} ) {
    
    const dispatch =  useDispatch()

    const {graphicFN, finished} = useSelector(state=>state.playAll)

    const [GL, setGL] = React.useState({})
    const [doOneResize,setDoOneResize] = React.useState(false)
    const [currentAudioPlayerFile,setCurrentAudioPlayerFile] = React.useState('No Audio Yet')
 
    const frameIdRef = React.useRef()
    const isRendering = React.useRef(false)
    const isPlayingRef = React.useRef(true)

    const fps = 30   //changed from 30 to 60 for demos
    const fpsInterval = 1000/fps

    const { isPlaying,acPlusRef,sectionNumber,graphicsFn } = GPUconfig

    const [gnum,setGnum] = React.useState(0)

    const ACtoUse = React.useRef()

    //console.log(GPUconfig.acRefs, sectionNumber)
    if (GPUconfig.acRefs) {
        ACtoUse.current = GPUconfig.acRefs.current[sectionNumber]
    }
    else {
        //replaced this with the useEffect for audioPlayerFile
    }

    const {audioPlayerFile} = useSelector( state=>state.singleProject )

    React.useEffect(()=>{
        if (currentAudioPlayerFile !== audioPlayerFile) {
            console.log('audio file has changed', audioPlayerFile, currentAudioPlayerFile)
            setCurrentAudioPlayerFile(audioPlayerFile)

            if ( !ACtoUse.current ) {
                console.log('new class ')
                ACtoUse.current = new AudioContextPlus()
            }

            const audioPlayer = document.getElementById("audioPlayer")           
            ACtoUse.current.changeAudio(audioPlayer)
            isPlayingRef.current = true

        }
    },[audioPlayerFile])

    const resizeRef = React.useRef(false)
    const [restart, setRestart] = React.useState(false)

    const restartRef = React.useState(false)

    React.useEffect(()=>{
        if (gnum !== graphicFN) {
            //isPlayingRef.current = false
            restartRef.current = true  //need a ref to interrupt the render loop
            setRestart(true)
            if (GL.renderer) { 
                //blowing away the current renderer and removing it from
                //the canvas is the only clean way I have found to do this
                //seems to waste resources - leave dangling refs? idk 
                //setGL({})
                //gpuDivRef.removeChild(gpuDivRef.firstChild)
                isPlayingRef.current = true
                isRendering.current = false
            }
        }
    },[graphicFN, gnum, GL.renderer, restartRef])

    React.useEffect(() => {
        // Handler to call on window resize
        function handleResize() {
          //console.log('resized', isRendering.current, GL )
          resizeRef.current = true  //the gpuDivRef will have the new dimensions
          if ( !isRendering.current ) {
            //if we are rendering the resize is caught in the 
            //animation loop
            //else do it outside
            setDoOneResize(true)
          }
        }
        // Add event listener
        window.addEventListener("resize", handleResize);
        // Call handler right away so state gets updated with initial window size
        handleResize();
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []); 

  
    React.useEffect(()=>{
        if (doOneResize && GL.renderer) {

            resizeRef.current = false;
            const newDim = gpuDivRef.getBoundingClientRect();
            const { width, height } = newDim;
            GL.camera.aspect = width / height;
            GL.camera.updateProjectionMatrix();
    
            if (GL.uniforms)
              GL.uniforms.iResolution.value = new THREE.Vector3(width, height, 1.0);
    
            GL.renderer.setSize(width, height);
            GL.renderer.render(GL.scene,GL.camera)
        }

        setDoOneResize(false)

    },[doOneResize])
 

    React.useEffect(()=>{
        if (finished) {
            if (GL.renderer) {
                console.log('disposing of current renderer')
                isPlayingRef.current = false
                isRendering.current = false
                GL.renderer.dispose()
                dispatch(setFinished(false))
                
            }
        }
   
    },[finished, GL.renderer, dispatch])

    React.useEffect(()=>{

        let canvas, canvasDim, hidden
        if ( gpuDivRef) {
            canvas = gpuDivRef
            canvasDim = canvas.getBoundingClientRect()
            hidden = (canvas.classList.value.includes('hidden') )
        }

        const Restart = restart && gpuDivRef && !hidden

        if ( ((gpuDivRef && !canvasInitialized 
            && !hidden && typeof graphicFN !== "undefined")
            || Restart) && !finished
            ) {

            setCanvasInitialized(true)
      
            const [width,height] = [canvasDim.width, canvasDim.height]
            //set canvas property so that we get WebGL2 ???
            //this is a long story but  in the end you need updated three.js npm version
            //which defaults to webgl2 - I explicitly installed three@0.149.0

            //console.log('is playing',isPlayingRef.current)

            const renderer = GL.renderer ?? new THREE.WebGLRenderer({antialias:true, alpha:true})
            
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height, true);  //get dimensions of gpuDivRef
            renderer.setClearColor("rgb(255,255,255)", 0);

            if ( !GL.renderer ) canvas.appendChild(renderer.domElement);
            
            const uniforms = {
                iTime: { value: 0 },
                iResolution: { value: new THREE.Vector3(width, height, 1.0) },
                iMusic: { value: new THREE.Vector4(0, 0, 0, 0) },
                //iChannel0:    { value: texture }, //not currently used
              };

            uniforms.iResolution.value = new THREE.Vector3(width, height, 1.0)
            const scene = new THREE.Scene();

            //console.log('in GPU', width,height, finished)

            let useShader = false
            let gfn=0
            setGnum(graphicFN)
            try {
                useShader = graphicsOptions[graphicFN].type === "shader"
                gfn = graphicsOptions[graphicFN].fn
            }
            catch {
                console.log('graphics Function num out of bounds', graphicFN)
            }
        
            if (useShader) {
                const {camera,material} = createShaderModel(scene,uniforms,gfn)
                setGL({renderer,scene,camera,width,height,useShader,material,uniforms})
                renderer.render(scene,camera)
            }
            else {
                
                //const {camera,light2,cube} = createVertexModel(scene,aspect)
                //setGL({renderer,scene,camera,width,height,useShader,cube,light2,uniforms}) 
                //renderer.render(scene,camera)

                setGL({})
                const grConfig = grInit( {renderer, width,height,version:gfn})
                const { camera, scene} = grConfig
                canvas.style.marginBottom = "2vh"

                const material = {}
                renderer.render( scene, camera)

                console.log('gfn ', gfn)
                setGL( {grConfig,renderer,camera,scene,material,uniforms,gfn} )

            }

            setRestart(false)

        }
        
        else if ( canvasInitialized ) {

            const {renderer,scene,camera,useShader,material,uniforms,gfn} = GL

            //isPlayingRef.current = isPlaying
            let prevRenderTime = Date.now()

            //console.log(isPlayingRef.current, isRendering.current, finished)
            if ( isPlayingRef.current && !isRendering.current && !finished ) {

                //console.log('in GPU 2')
                requestAnimationFrame(render)
                isRendering.current = true
                //console.log(ACtoUse.current)
            }

            function render(time) {

                if ( !isPlayingRef.current || restartRef.current ) {
                    isRendering.current = false

                    //idk if this is necessary
                    if (restartRef.current) {
                        renderer.dispose()
                        //if (material) material.dispose()
                    }
                    cancelAnimationFrame(frameIdRef.current)
                    return
                } 

                if ( resizeRef.current) {
                    resizeRef.current = false
                    const newDim = gpuDivRef.getBoundingClientRect()
                    const {width,height} = newDim
                    camera.aspect = width/height
                    camera.updateProjectionMatrix()

                    if (uniforms) uniforms.iResolution.value = new THREE.Vector3(width, height, 1.0)
                    renderer.setSize(width,height)
                }

                if (isPlayingRef.current && !restartRef.current && !finished) 
                    frameIdRef.current = requestAnimationFrame(render);
                else return

                //we are rendering way too many times a second
                const currentRenderTime = Date.now()
                const elapsed = currentRenderTime - prevRenderTime

                if ( elapsed < fpsInterval ) return;

                prevRenderTime = currentRenderTime - (elapsed%fpsInterval)
                time *= .001  //convert from milliseconds to seconds

                //const AC =  ACtoUse.current //acPlusRef 
                //console.log(AC.AC.state)

                let md = { sumLow:0, sumMid:0, sumHigh:0, sum: 0, wsum1:0, wsum2:0}; 

                if ( ACtoUse.current) {
                    md = ACtoUse.current.musicData()
                }
     
                if ( useShader ) {
                    animateShaderModel(GL,md, time)

                    //console.log(md.sum)
                    renderer.render(scene,camera)
                }
                else {
                    //console.log('gfn',gfn)
                    renderGR(md, gfn, renderer)
                    //animateVertexModel(GL,md)
                }

            }
        }

        //React is wrong about missing dependencies here:
    },[gpuDivRef,canvasInitialized,GL,fpsInterval,
        setCanvasInitialized,isPlaying,acPlusRef,
        sectionNumber,graphicsFn,GPUconfig,
        graphicFN,gnum,restart,isPlayingRef.current])
   
}
