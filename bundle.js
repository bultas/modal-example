(function () {
  'use strict';

  const MicroModal = (() => {

    const FOCUSABLE_ELEMENTS = ['a[href]', 'area[href]', 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', 'select:not([disabled]):not([aria-hidden])', 'textarea:not([disabled]):not([aria-hidden])', 'button:not([disabled]):not([aria-hidden])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];

    class Modal {
      constructor({
        targetModal,
        triggers = [],
        onShow = () => {},
        onClose = () => {},
        openTrigger = 'data-micromodal-trigger',
        closeTrigger = 'data-micromodal-close',
        disableScroll = false,
        disableFocus = false,
        awaitCloseAnimation = false,
        awaitOpenAnimation = false,
        debugMode = false
      }) {
        // Save a reference of the modal
        this.modal = document.getElementById(targetModal); // Save a reference to the passed config

        this.config = {
          debugMode,
          disableScroll,
          openTrigger,
          closeTrigger,
          onShow,
          onClose,
          awaitCloseAnimation,
          awaitOpenAnimation,
          disableFocus // Register click events only if pre binding eventListeners

        };
        if (triggers.length > 0) this.registerTriggers(...triggers); // pre bind functions for event listeners

        this.onClick = this.onClick.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
      }
      /**
       * Loops through all openTriggers and binds click event
       * @param  {array} triggers [Array of node elements]
       * @return {void}
       */


      registerTriggers(...triggers) {
        triggers.filter(Boolean).forEach(trigger => {
          trigger.addEventListener('click', event => this.showModal(event));
        });
      }

      showModal() {
        this.activeElement = document.activeElement;
        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.classList.add('is-open');
        this.scrollBehaviour('disable');
        this.addEventListeners();

        if (this.config.awaitOpenAnimation) {
          const handler = () => {
            this.modal.removeEventListener('animationend', handler, false);
            this.setFocusToFirstNode();
          };

          this.modal.addEventListener('animationend', handler, false);
        } else {
          this.setFocusToFirstNode();
        }

        this.config.onShow(this.modal, this.activeElement);
      }

      closeModal() {
        const modal = this.modal;
        this.modal.setAttribute('aria-hidden', 'true');
        this.removeEventListeners();
        this.scrollBehaviour('enable');

        if (this.activeElement) {
          this.activeElement.focus();
        }

        this.config.onClose(this.modal);

        if (this.config.awaitCloseAnimation) {
          this.modal.addEventListener('animationend', function handler() {
            modal.classList.remove('is-open');
            modal.removeEventListener('animationend', handler, false);
          }, false);
        } else {
          modal.classList.remove('is-open');
        }
      }

      closeModalById(targetModal) {
        this.modal = document.getElementById(targetModal);
        if (this.modal) this.closeModal();
      }

      scrollBehaviour(toggle) {
        if (!this.config.disableScroll) return;
        const body = document.querySelector('body');

        switch (toggle) {
          case 'enable':
            Object.assign(body.style, {
              overflow: '',
              height: ''
            });
            break;

          case 'disable':
            Object.assign(body.style, {
              overflow: 'hidden',
              height: '100vh'
            });
            break;
        }
      }

      addEventListeners() {
        this.modal.addEventListener('touchstart', this.onClick);
        this.modal.addEventListener('click', this.onClick);
        document.addEventListener('keydown', this.onKeydown);
      }

      removeEventListeners() {
        this.modal.removeEventListener('touchstart', this.onClick);
        this.modal.removeEventListener('click', this.onClick);
        document.removeEventListener('keydown', this.onKeydown);
      }

      onClick(event) {
        if (event.target.hasAttribute(this.config.closeTrigger)) {
          this.closeModal();
          event.preventDefault();
        }
      }

      onKeydown(event) {
        if (event.keyCode === 27) this.closeModal(event);
        if (event.keyCode === 9) this.maintainFocus(event);
      }

      getFocusableNodes() {
        const nodes = this.modal.querySelectorAll(FOCUSABLE_ELEMENTS);
        return Array(...nodes);
      }

      setFocusToFirstNode() {
        if (this.config.disableFocus) return;
        const focusableNodes = this.getFocusableNodes();
        if (focusableNodes.length) focusableNodes[0].focus();
      }

      maintainFocus(event) {
        const focusableNodes = this.getFocusableNodes(); // if disableFocus is true

        if (!this.modal.contains(document.activeElement)) {
          focusableNodes[0].focus();
        } else {
          const focusedItemIndex = focusableNodes.indexOf(document.activeElement);

          if (event.shiftKey && focusedItemIndex === 0) {
            focusableNodes[focusableNodes.length - 1].focus();
            event.preventDefault();
          }

          if (!event.shiftKey && focusedItemIndex === focusableNodes.length - 1) {
            focusableNodes[0].focus();
            event.preventDefault();
          }
        }
      }

    }
    /**
     * Modal prototype ends.
     * Here on code is responsible for detecting and
     * auto binding event handlers on modal triggers
     */
    // Keep a reference to the opened modal


    let activeModal = null;
    /**
     * Generates an associative array of modals and it's
     * respective triggers
     * @param  {array} triggers     An array of all triggers
     * @param  {string} triggerAttr The data-attribute which triggers the module
     * @return {array}
     */

    const generateTriggerMap = (triggers, triggerAttr) => {
      const triggerMap = [];
      triggers.forEach(trigger => {
        const targetModal = trigger.attributes[triggerAttr].value;
        if (triggerMap[targetModal] === undefined) triggerMap[targetModal] = [];
        triggerMap[targetModal].push(trigger);
      });
      return triggerMap;
    };
    /**
     * Validates whether a modal of the given id exists
     * in the DOM
     * @param  {number} id  The id of the modal
     * @return {boolean}
     */


    const validateModalPresence = id => {
      if (!document.getElementById(id)) {
        console.warn(`MicroModal: \u2757Seems like you have missed %c'${id}'`, 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', 'ID somewhere in your code. Refer example below to resolve it.');
        console.warn(`%cExample:`, 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', `<div class="modal" id="${id}"></div>`);
        return false;
      }
    };
    /**
     * Validates if there are modal triggers present
     * in the DOM
     * @param  {array} triggers An array of data-triggers
     * @return {boolean}
     */


    const validateTriggerPresence = triggers => {
      if (triggers.length <= 0) {
        console.warn(`MicroModal: \u2757Please specify at least one %c'micromodal-trigger'`, 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', 'data attribute.');
        console.warn(`%cExample:`, 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', `<a href="#" data-micromodal-trigger="my-modal"></a>`);
        return false;
      }
    };
    /**
     * Checks if triggers and their corresponding modals
     * are present in the DOM
     * @param  {array} triggers   Array of DOM nodes which have data-triggers
     * @param  {array} triggerMap Associative array of modals and their triggers
     * @return {boolean}
     */


    const validateArgs = (triggers, triggerMap) => {
      validateTriggerPresence(triggers);
      if (!triggerMap) return true;

      for (var id in triggerMap) validateModalPresence(id);

      return true;
    };
    /**
     * Binds click handlers to all modal triggers
     * @param  {object} config [description]
     * @return void
     */


    const init = config => {
      // Create an config object with default openTrigger
      const options = Object.assign({}, {
        openTrigger: 'data-micromodal-trigger'
      }, config); // Collects all the nodes with the trigger

      const triggers = [...document.querySelectorAll(`[${options.openTrigger}]`)]; // Makes a mappings of modals with their trigger nodes

      const triggerMap = generateTriggerMap(triggers, options.openTrigger); // Checks if modals and triggers exist in dom

      if (options.debugMode === true && validateArgs(triggers, triggerMap) === false) return; // For every target modal creates a new instance

      for (var key in triggerMap) {
        let value = triggerMap[key];
        options.targetModal = key;
        options.triggers = [...value];
        activeModal = new Modal(options); // eslint-disable-line no-new
      }
    };
    /**
     * Shows a particular modal
     * @param  {string} targetModal [The id of the modal to display]
     * @param  {object} config [The configuration object to pass]
     * @return {void}
     */


    const show = (targetModal, config) => {
      const options = config || {};
      options.targetModal = targetModal; // Checks if modals and triggers exist in dom

      if (options.debugMode === true && validateModalPresence(targetModal) === false) return; // stores reference to active modal

      activeModal = new Modal(options); // eslint-disable-line no-new

      activeModal.showModal();
    };
    /**
     * Closes the active modal
     * @param  {string} targetModal [The id of the modal to close]
     * @return {void}
     */


    const close = targetModal => {
      targetModal ? activeModal.closeModalById(targetModal) : activeModal.closeModal();
    };

    return {
      init,
      show,
      close
    };
  })();

  // @ts-check

  const createModalHTML = ({ prefix, modalID }) => ({
    title,
    content
  }) => `
<style>
  .${prefix}_modal {
    font-family: -apple-system,BlinkMacSystemFont,avenir next,avenir,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif;
  }

  .${prefix}_modal__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .${prefix}_modal__container {
    background-color: #fff;
    padding: 30px;
    max-width: 500px;
    max-height: 100vh;
    border-radius: 4px;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .${prefix}_modal__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .${prefix}_modal__title {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.25;
    color: #00449e;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }

  .${prefix}_modal__title > img {
    max-height: 1em;
  }

  .${prefix}_modal__title > img + span {
    margin-left: .5em;
  }

  .${prefix}_modal__close {
    background: transparent;
    border: 0;
  }

  .${prefix}_modal__header .${prefix}_modal__close:before { content: "\u2715"; }

  .${prefix}_modal__content {
    margin-top: 2rem;
    margin-bottom: 2rem;
    line-height: 1.5;
    color: rgba(0,0,0,.8);
  }

  .${prefix}_modal__btn {
    font-size: .875rem;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: .5rem;
    padding-bottom: .5rem;
    background-color: #e6e6e6;
    color: rgba(0,0,0,.8);
    border-radius: .25rem;
    border-style: none;
    border-width: 0;
    cursor: pointer;
    -webkit-appearance: button;
    text-transform: none;
    overflow: visible;
    line-height: 1.15;
    margin: 0;
    will-change: transform;
    -moz-osx-font-smoothing: grayscale;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    transition: -webkit-transform .25s ease-out;
    transition: transform .25s ease-out;
    transition: transform .25s ease-out,-webkit-transform .25s ease-out;
  }

  .${prefix}_modal__btn:focus, .${prefix}_modal__btn:hover {
    -webkit-transform: scale(1.05);
    transform: scale(1.05);
  }

  .${prefix}_modal__btn-primary {
    background-color: #00449e;
    color: #fff;
  }

  @keyframes ${prefix}_mmfadeIn {
      from { opacity: 0; }
        to { opacity: 1; }
  }

  @keyframes ${prefix}_mmfadeOut {
      from { opacity: 1; }
        to { opacity: 0; }
  }

  @keyframes ${prefix}_mmslideIn {
    from { transform: translateY(15%); }
      to { transform: translateY(0); }
  }

  @keyframes ${prefix}_mmslideOut {
      from { transform: translateY(0); }
      to { transform: translateY(-10%); }
  }

  .${prefix}_micromodal-slide {
    display: none;
  }

  .${prefix}_micromodal-slide.is-open {
    display: block;
  }

  .${prefix}_micromodal-slide[aria-hidden="false"] .${prefix}_modal__overlay {
    animation: mmfadeIn .3s cubic-bezier(0.0, 0.0, 0.2, 1);
  }

  .${prefix}_micromodal-slide[aria-hidden="false"] .${prefix}_modal__container {
    animation: mmslideIn .3s cubic-bezier(0, 0, .2, 1);
  }

  .${prefix}_micromodal-slide[aria-hidden="true"] .${prefix}_modal__overlay {
    animation: mmfadeOut .3s cubic-bezier(0.0, 0.0, 0.2, 1);
  }

  .${prefix}_micromodal-slide[aria-hidden="true"] .${prefix}_modal__container {
    animation: mmslideOut .3s cubic-bezier(0, 0, .2, 1);
  }

  .${prefix}_micromodal-slide .${prefix}_modal__container,
  .${prefix}_micromodal-slide .${prefix}_modal__overlay {
    will-change: transform;
  }
</style>
<div class="${prefix}_modal ${prefix}_micromodal-slide" id="${modalID}" aria-hidden="true">
<div class="${prefix}_modal__overlay" tabindex="-1" data-micromodal-close>
  <div class="${prefix}_modal__container" role="dialog" aria-modal="true" aria-labelledby="${prefix}_modal_title_ID">
    <header class="${prefix}_modal__header">
      <h2 class="${prefix}_modal__title" id="${prefix}_modal_title_ID">
        ${title}
      </h2>
      <button class="${prefix}_modal__close" aria-label="Close modal" data-micromodal-close></button>
    </header>
    <main class="${prefix}_modal__content" id="${prefix}_modal_content_ID">
      ${content}
    </main>
    <footer class="${prefix}_modal__footer">
      <button class="${prefix}_modal__btn" data-micromodal-close aria-label="Close this dialog window">Close</button>
    </footer>
  </div>
</div>
</div>
`;

  const favicon = `<img src='/favicon.ico' onerror="this.onerror=null;this.src='//google.com/favicon.ico';" />`;

  // @ts-check

  const createModalElement = innerHTML => {
    const modalElement = document.createElement("div");
    modalElement.innerHTML = innerHTML;

    return modalElement;
  };

  // @ts-check

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

}());
