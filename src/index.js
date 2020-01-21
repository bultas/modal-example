// @ts-check

import MicroModal from "micromodal";
import { createModalHTML } from "./template.js";
import { createModalElement } from "./factory.js";

const prefix = `_${Math.random()
  .toString(36)
  .substring(7)}`;

const MODAL_ID = `${prefix}_modal`;
const ModalTemplate = createModalHTML({ prefix, modalID: MODAL_ID });

const modalElement = createModalElement(
  ModalTemplate({
    title: "hello",
    content: "world"
  })
);

setTimeout(() => {
  document.body.appendChild(modalElement);

  MicroModal.init();
  MicroModal.show(MODAL_ID);
}, 0);
