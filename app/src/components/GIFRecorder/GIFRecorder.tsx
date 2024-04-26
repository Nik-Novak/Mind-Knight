"use client";
import { useStore } from "@/zustand/store";
import { useEffect, useRef, useState } from "react";
import LoadingOverlay from "../LoadingOverlay";
import domtoimage from "dom-to-image";
//@ts-expect-error
import GIF from 'gif.js.optimized';

type Props = {
  recording:boolean,
  minTimestamp: number,
  maxTimestamp: number,
  onFinish:(blob:Blob)=>void
}

export default function GIFRecorder({recording, minTimestamp, maxTimestamp, onFinish}:Props){
  const playhead = useStore(state=>state.playhead);
  const setPlayhead = useStore(state=>state.setPlayHead);
  const incrementPlayHead = useStore(state=>state.incrementPlayHead);
  const [fallbackTrigger, setFallbackTrigger] = useState(false);
  const gif = useRef<GIF|null>(null);
  useEffect(()=>{
    if(!recording) return;
  (async ()=>{
    // let canvas = await html2canvas(document.body, {
    //   ignoreElements:element=>element.classList.contains('MuiDialog-root') || element.classList.contains('MuiBackdrop-root')
    // });
    let base64Img = await domtoimage.toPng(document.body, {
      filter(node) {
        if(node instanceof Element ){
          return !node.classList.contains('MuiBackdrop-root') && !node.classList.contains('MuiDialog-root');
        }
        return true;
      },
    });
    
    // let base64Img = await domtoimage.toPng(document.body);
    let img = new Image();
    img.src = base64Img;
    img.onload = function(){
      gif.current.addFrame(img, { delay:1000 });
      if(playhead >= maxTimestamp){
        gif.current.render();
      }
      else
        incrementPlayHead(1000, [minTimestamp, maxTimestamp]);
    }

    
  })();
  }, [playhead, fallbackTrigger]);

  useEffect(()=>{
    if(recording){
      let workerScript = `${window.location.protocol}//${window.location.host}/gif.worker.js`;
      gif.current = new GIF({
        workerScript
      });
      gif.current.on('finished', function(blob:Blob) {
        console.log('FINISHED GIF GEN!');
        onFinish(blob);
      });
      if(playhead!=minTimestamp)
        setPlayhead(minTimestamp);
      else
        setFallbackTrigger(t=>!t); //trigger start in the case that time is already at 0
    }
  }, [recording])

  return <LoadingOverlay open={recording} type="car" loadingContent='MindKnight is creating your GIF...' />;
}