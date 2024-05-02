"use client";
import { useStore } from "@/zustand/store";
import { useEffect, useRef, useState } from "react";
import LoadingOverlay from "../LoadingOverlay";
import domtoimage from "dom-to-image";

type Props = {
  recording:boolean,
  minTimestamp: number,
  maxTimestamp: number,
  onFinish:(blob:Blob)=>void
}

export default function GIFRecorder({recording, minTimestamp, maxTimestamp, onFinish}:Props){
  const playhead = useStore(state=>state.playhead);
  const setPlayhead = useStore(state=>state.setPlayhead);
  const incrementPlayhead = useStore(state=>state.incrementPlayhead);
  const [fallbackTrigger, setFallbackTrigger] = useState(false);
  const gif = useRef<any|null>(null);

  const captureFrame = async()=>{
    let base64Img = await domtoimage.toPng(document.body, {
      filter(node) {
        if(node instanceof Element ){
          return !node.classList.contains('MuiBackdrop-root') && !node.classList.contains('MuiDialog-root');
        }
        return true;
      },
    });
    let img = new Image();
    img.src = base64Img;
    img.onload = function(){
      gif.current.addFrame(img, { delay:1000 });
      if(playhead >= maxTimestamp){
        gif.current.render();
      }
      else
        incrementPlayhead(1000, [minTimestamp, maxTimestamp]);
    }
  }
  useEffect(()=>{
    if(!recording) return;
    captureFrame();
  }, [playhead, fallbackTrigger]);

  useEffect(()=>{
    //@ts-expect-error
    import('gif.js.optimized').then((module) => {
      const GIF = module.default;
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
    });
  }, [recording])

  return <LoadingOverlay open={recording} type="car" loadingContent='MindKnight is creating your GIF...' />;
}