// @ts-check

import MicroModal from "micromodal";
import { createModalHTML, favicon } from "./template.js";
import { createModalElement } from "./factory.js";

const prefix = `_${Math.random()
  .toString(36)
  .substring(7)}`;

const MODAL_ID = `${prefix}_modal`;
const modalTemplate = createModalHTML({ prefix, modalID: MODAL_ID });

const modalTitle = `
  ${favicon}  
  <span>Zprava od ${window.location.hostname}</span>
`;

const modalContent = `
  <p>Vas prohlizec</p>
  <code> ${window.navigator.userAgent}</code>
  <p>je s nasim webem plne kompatibilni.</p>
`;

const modalElement = createModalElement(
  modalTemplate({
    title: modalTitle,
    content: modalContent
  })
);

setTimeout(() => {
  document.body.appendChild(modalElement);

  MicroModal.init();
  MicroModal.show(MODAL_ID);
}, 0);
