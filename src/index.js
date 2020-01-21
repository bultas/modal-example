// @ts-check

import MicroModal from "micromodal";

import {
  createModalHTML,
  createImage,
  createModalContent,
  createModalTitle
} from "./template.js";
import { createModalElement } from "./factory.js";

const prefix = `_${Math.random()
  .toString(36)
  .substring(7)}`;

const MODAL_ID = `${prefix}_modal`;
const modalTemplate = createModalHTML({ prefix, modalID: MODAL_ID });

const favicon = createImage({
  src: "/favicon.ico",
  fallback: "//google.com/favicon.ico"
});

const modalContent = createModalContent({
  browser: window.navigator.userAgent
});

const modalTitle = createModalTitle({
  location: window.location.hostname,
  favicon: favicon
});

const modalHTML = modalTemplate({
  title: modalTitle,
  content: modalContent
});

const modalElement = createModalElement(modalHTML);

setTimeout(() => {
  document.body.appendChild(modalElement);

  MicroModal.init();
  MicroModal.show(MODAL_ID);
}, 5000);
