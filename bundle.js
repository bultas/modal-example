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
  var createModalHTML = function createModalHTML(_ref) {
    var prefix = _ref.prefix,
        modalID = _ref.modalID;
    return function (_ref2) {
      var title = _ref2.title,
          content = _ref2.content;
      return "\n<style>\n  .".concat(prefix, "_modal {\n    font-family: -apple-system,BlinkMacSystemFont,avenir next,avenir,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif;\n  }\n\n  .").concat(prefix, "_modal__overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: rgba(0,0,0,0.6);\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  }\n\n  .").concat(prefix, "_modal__container {\n    background-color: #fff;\n    padding: 30px;\n    max-width: 500px;\n    max-height: 100vh;\n    border-radius: 4px;\n    overflow-y: auto;\n    box-sizing: border-box;\n  }\n\n  .").concat(prefix, "_modal__header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n  }\n\n  .").concat(prefix, "_modal__title {\n    margin-top: 0;\n    margin-bottom: 0;\n    font-weight: 600;\n    font-size: 1.25rem;\n    line-height: 1.25;\n    color: #00449e;\n    box-sizing: border-box;\n    display: flex;\n    align-items: center;\n  }\n\n  .").concat(prefix, "_modal__title > img {\n    max-height: 1em;\n  }\n\n  .").concat(prefix, "_modal__title > img + span {\n    margin-left: .5em;\n  }\n\n  .").concat(prefix, "_modal__close {\n    background: transparent;\n    border: 0;\n  }\n\n  .").concat(prefix, "_modal__header .").concat(prefix, "_modal__close:before { content: \"\u2715\"; }\n\n  .").concat(prefix, "_modal__content {\n    margin-top: 2rem;\n    margin-bottom: 2rem;\n    line-height: 1.5;\n    color: rgba(0,0,0,.8);\n  }\n\n  .").concat(prefix, "_modal__btn {\n    font-size: .875rem;\n    padding-left: 1rem;\n    padding-right: 1rem;\n    padding-top: .5rem;\n    padding-bottom: .5rem;\n    background-color: #e6e6e6;\n    color: rgba(0,0,0,.8);\n    border-radius: .25rem;\n    border-style: none;\n    border-width: 0;\n    cursor: pointer;\n    -webkit-appearance: button;\n    text-transform: none;\n    overflow: visible;\n    line-height: 1.15;\n    margin: 0;\n    will-change: transform;\n    -moz-osx-font-smoothing: grayscale;\n    -webkit-backface-visibility: hidden;\n    backface-visibility: hidden;\n    -webkit-transform: translateZ(0);\n    transform: translateZ(0);\n    transition: -webkit-transform .25s ease-out;\n    transition: transform .25s ease-out;\n    transition: transform .25s ease-out,-webkit-transform .25s ease-out;\n  }\n\n  .").concat(prefix, "_modal__btn:focus, .").concat(prefix, "_modal__btn:hover {\n    -webkit-transform: scale(1.05);\n    transform: scale(1.05);\n  }\n\n  .").concat(prefix, "_modal__btn-primary {\n    background-color: #00449e;\n    color: #fff;\n  }\n\n  @keyframes ").concat(prefix, "_mmfadeIn {\n      from { opacity: 0; }\n        to { opacity: 1; }\n  }\n\n  @keyframes ").concat(prefix, "_mmfadeOut {\n      from { opacity: 1; }\n        to { opacity: 0; }\n  }\n\n  @keyframes ").concat(prefix, "_mmslideIn {\n    from { transform: translateY(15%); }\n      to { transform: translateY(0); }\n  }\n\n  @keyframes ").concat(prefix, "_mmslideOut {\n      from { transform: translateY(0); }\n      to { transform: translateY(-10%); }\n  }\n\n  .").concat(prefix, "_micromodal-slide {\n    display: none;\n  }\n\n  .").concat(prefix, "_micromodal-slide.is-open {\n    display: block;\n  }\n\n  .").concat(prefix, "_micromodal-slide[aria-hidden=\"false\"] .").concat(prefix, "_modal__overlay {\n    animation: mmfadeIn .3s cubic-bezier(0.0, 0.0, 0.2, 1);\n  }\n\n  .").concat(prefix, "_micromodal-slide[aria-hidden=\"false\"] .").concat(prefix, "_modal__container {\n    animation: mmslideIn .3s cubic-bezier(0, 0, .2, 1);\n  }\n\n  .").concat(prefix, "_micromodal-slide[aria-hidden=\"true\"] .").concat(prefix, "_modal__overlay {\n    animation: mmfadeOut .3s cubic-bezier(0.0, 0.0, 0.2, 1);\n  }\n\n  .").concat(prefix, "_micromodal-slide[aria-hidden=\"true\"] .").concat(prefix, "_modal__container {\n    animation: mmslideOut .3s cubic-bezier(0, 0, .2, 1);\n  }\n\n  .").concat(prefix, "_micromodal-slide .").concat(prefix, "_modal__container,\n  .").concat(prefix, "_micromodal-slide .").concat(prefix, "_modal__overlay {\n    will-change: transform;\n  }\n</style>\n<div class=\"").concat(prefix, "_modal ").concat(prefix, "_micromodal-slide\" id=\"").concat(modalID, "\" aria-hidden=\"true\">\n<div class=\"").concat(prefix, "_modal__overlay\" tabindex=\"-1\" data-micromodal-close>\n  <div class=\"").concat(prefix, "_modal__container\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"").concat(prefix, "_modal_title_ID\">\n    <header class=\"").concat(prefix, "_modal__header\">\n      <h2 class=\"").concat(prefix, "_modal__title\" id=\"").concat(prefix, "_modal_title_ID\">\n        ").concat(title, "\n      </h2>\n      <button class=\"").concat(prefix, "_modal__close\" aria-label=\"Close modal\" data-micromodal-close></button>\n    </header>\n    <main class=\"").concat(prefix, "_modal__content\" id=\"").concat(prefix, "_modal_content_ID\">\n      ").concat(content, "\n    </main>\n    <footer class=\"").concat(prefix, "_modal__footer\">\n      <button class=\"").concat(prefix, "_modal__btn\" data-micromodal-close aria-label=\"Close this dialog window\">Close</button>\n    </footer>\n  </div>\n</div>\n</div>\n");
    };
  };
  var createImage = function createImage(_ref3) {
    var src = _ref3.src,
        fallback = _ref3.fallback;
    return "<img src='".concat(src, "' onerror=\"this.onerror=null;this.src='").concat(fallback, "';\" />");
  };
  var createModalTitle = function createModalTitle(_ref4) {
    var favicon = _ref4.favicon,
        location = _ref4.location;
    return "\n  ".concat(favicon, "  \n  <span>Zprava od ").concat(window.location.hostname, "</span>\n");
  };
  var createModalContent = function createModalContent(_ref5) {
    var browser = _ref5.browser;
    return "\n  <p>Vas prohlizec</p>\n  <code> ".concat(window.navigator.userAgent, "</code>\n  <p>je s nasim webem plne kompatibilni.</p>\n");
  };

  // @ts-check
  var createModalElement = function createModalElement(innerHTML) {
    var modalElement = document.createElement("div");
    modalElement.innerHTML = innerHTML;
    return modalElement;
  };

  // @ts-check
  var prefix = "_".concat(Math.random().toString(36).substring(7));
  var MODAL_ID = "".concat(prefix, "_modal");
  var modalTemplate = createModalHTML({
    prefix: prefix,
    modalID: MODAL_ID
  });
  var favicon = createImage({
    src: "/favicon.ico",
    fallback: "//google.com/favicon.ico"
  });
  var modalContent = createModalContent({
    browser: window.navigator.userAgent
  });
  var modalTitle = createModalTitle({
    location: window.location.hostname,
    favicon: favicon
  });
  var modalHTML = modalTemplate({
    title: modalTitle,
    content: modalContent
  });
  var modalElement = createModalElement(modalHTML);
  setTimeout(function () {
    document.body.appendChild(modalElement);
    MicroModal.init();
    MicroModal.show(MODAL_ID);
  }, 0);

}());
