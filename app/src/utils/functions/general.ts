

export async function copyToClipboard(textToCopy:string) {
  // Navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
  } else {
      // Use the 'out of viewport hidden text area' trick
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
          
      // Move textarea out of the viewport so it's not visible
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
          
      document.body.prepend(textArea);
      textArea.select();

      try {
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