

export async function copyToClipboard(textToCopy:string) {
  // Navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
  } else {
      // Use the 'out of viewport hidden text area' trick
      const textArea = document.createElement("textarea");
      textArea.id = 'hello-copy'
      textArea.value = textToCopy;
          
      // Move textarea out of the viewport so it's not visible
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
          
      document.body.prepend(textArea);
      textArea.focus();
      textArea.select();

      await sleep(80); //ensure focus is lost from other events

      textArea.focus();
      textArea.select();

      try {
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          console.log('Copied', textToCopy, 'Successfully');
      } catch (error) {
          console.error(error);
      } finally {
          textArea.remove();
      }
  }
}

export const dateTimeReviver = (key: any, value: any) => {
    let reDateDetect = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
    if (typeof value == 'string' && (reDateDetect.exec(value))) {
        return new Date(value);
    }
    return value;
  };

export function getTimeComponents(from: Date | number, to?: Date | number) {
  let toStamp = to!==undefined ? to.valueOf() : new Date().valueOf();

  // Calculate the difference in milliseconds
  let timeDifference = toStamp - from.valueOf();

  // Convert milliseconds to seconds, minutes, and hours
  let seconds = Math.floor((timeDifference / 1000) % 60);
  let minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
  let hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);

  return { seconds, minutes, hours };
}

export function getTimeDifferenceFromString(timeString?: string|null, from?: Date|number) {
  if(!timeString || from===undefined) return undefined;
  const regex = /(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(\d+)\s*s/;
  const match = timeString.match(regex);
  if (!match) {
    // return undefined;
    throw new Error('Invalid time string format');
  }
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = parseInt(match[3], 10);
  const totalMilliseconds = hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
  return from.valueOf() + totalMilliseconds;
}

export function getTimeString({hours, minutes, seconds}: {hours?:number, minutes?:number, seconds:number}){
  let label = '';
  if(hours)
    label += `${hours}h `
  if(minutes)
    label += `${minutes}m `
  label += `${seconds}s`;
  return label;
}

export function sleep(durationMs:number){
  if(durationMs <=0)
    throw Error("Cannot sleep for 0 or less ms");
  return new Promise(res=>setTimeout(res, durationMs));
}

type Predicate = (...args:any[])=>boolean;
export function waitUntil(predicate:Predicate, timeout?:number, checkEvery = 1000){
  if(checkEvery <=0) throw Error("checkEvery must be a positive number");
  if(timeout && timeout <=0) throw Error("timeout must be a positive number");
  return new Promise<void>((resolve, reject)=>{
    let checkInterval = setInterval(()=>{
      console.log('CHECKING:', predicate());
      if(predicate()){
        clearInterval(checkInterval);
        resolve()
      }
    }, checkEvery);
    if(timeout)
      setTimeout(()=>reject(`waitUntil reached timeout of ${timeout}ms`), timeout);
  });
}

export async function checkResourceExists(path:string){
  const response = await fetch(path, { method: 'HEAD' });
  return response.ok;
}

export function insertBetween(array:any[], element:any) {
  return array.reduce((acc, curr, index) => {
      acc.push(curr);
      if (index < array.length - 1) {
          acc.push(element);
      }
      return acc;
  }, []);
}

export function removeSearchParam(url:string, paramToRemove:string) {
  const urlObject = new URL(url);
  const searchParams = new URLSearchParams(urlObject.search);
  searchParams.delete(paramToRemove);
  urlObject.search = searchParams.toString();
  return urlObject.toString();
}

export function download(blob:Blob, filename:string){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getDarkenedImage(base64Image:string){
  // Create an image element
  const img = new Image();
  // Set the source of the image to the base64 string
  img.src = base64Image;
  // Create a canvas element
  const canvas = document.createElement('canvas');
  // Wait for the image to load
  return new Promise<string>((resolve, reject)=>{
    img.onload = () => {
      // Set canvas dimensions to match image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      // Get context of the canvas
      const ctx = canvas.getContext('2d')!;
      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data (pixel data)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      // Iterate over each pixel
      for (let i = 0; i < data.length; i += 4) {
        // Check alpha channel (transparency)
        const alpha = data[i + 3];
        // If not transparent, darken the pixel
        if (alpha !== 0) {
          // You can adjust the amount of darkening here by modifying the values
          data[i] *= 0.01; // Red channel
          data[i + 1] *= 0.05; // Green channel
          data[i + 2] *= 0.05; // Blue channel
        }
      }
      // Put the modified image data back onto the canvas
      ctx.putImageData(imageData, 0, 0);
      // Draw a large white question mark in the middle of the image
      const questionMarkSize = Math.min(canvas.width, canvas.height) * 0.7;
      ctx.fillStyle = '#ffffff'; // White color
      ctx.font = `${questionMarkSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', canvas.width / 2, canvas.height / 2);
      // Convert canvas to base64 string
      const modifiedBase64 = canvas.toDataURL();
      // Do something with modifiedBase64 (return it or pass it to another function)
      return resolve(modifiedBase64);
    };
    img.onerror = reject;
  })
  
}