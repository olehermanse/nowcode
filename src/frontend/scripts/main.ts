import { editor_start } from "./editor.ts";
import { clipboard_start } from "./clipboard.ts";

(() => {
  editor_start();
  clipboard_start();

  const createNewBtn = document.getElementById("createNewBtn");
  createNewBtn.addEventListener("click", () => {
    window.location.replace("/");
  });
})();
