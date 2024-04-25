

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
      // textArea.style.left = "-9999px";
          
      document.body.prepend(textArea);
      textArea.focus();
      textArea.select();

      await sleep(40); //ensure focus is lost from other events

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
  let fromDate = typeof from === 'number' ? new Date(from) : from;
  let toDate = to ? (typeof to === 'number' ? new Date(to) : to) : new Date();

  // Calculate the difference in milliseconds
  let timeDifference = toDate.getTime() - fromDate.getTime();

  // Convert milliseconds to seconds, minutes, and hours
  let seconds = Math.floor((timeDifference / 1000) % 60);
  let minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
  let hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);

  return { seconds, minutes, hours };
}

export function getTimeDifferenceFromString(timeString?: string|null, from?: Date) {
  if(!timeString || !from) return undefined;
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
  return new Date(from.getTime() + totalMilliseconds);
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