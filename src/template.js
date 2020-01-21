// @ts-check

export const createModalHTML = ({ prefix, modalID }) => ({
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
