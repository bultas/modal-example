// @ts-check

export const createModalElement = innerHTML => {
  const modalElement = document.createElement("div");
  modalElement.innerHTML = innerHTML;

  return modalElement;
};
