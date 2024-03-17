async function setClipboard(text) {
  const type = "text/plain";
  const blob = new Blob([text], { type });
  const data = [new ClipboardItem({ [type]: blob })];
  await navigator.clipboard.write(data);
}

export function clipboard_start() {
  (() => {
    const clipboardBtn = document.getElementById("clipboardBtn");
    const shareLink = document.getElementById("shareLink");
    const text: string = window.location.host + window.location.pathname;
    shareLink.value = text;
    clipboardBtn.addEventListener("click", () => {
      setClipboard(text);
    });
  })();
}
