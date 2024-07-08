import {entity} from './entity.js';


export const ui_controller = (() => {

  const _PHRASES = [
    [' ', 5],
    ['@Charles965: All wings report in.', 10],
    ['@JNR: I am a leaf on the wind...', 10],
    ['@JNR: Watch how I fly.', 10],
    ["@Charles965: Hey uhhh don't forget to tag in.", 10],
    ["@Rhofiwa: I'm coming in hot!", 10],
    ["@Charles965: Please call the station for backup, I need more help!!!", 10],
    ["@Payet: Moya... come in.", 10],
    ["@Payet: It's a ship, a LIVING ship.", 10],
    ["@Charles965: Also, contribute to my battle.", 10],
    ['@Kat: I am Kai, last of the Brunnen-G.', 10],
    ["@Charles965: Really need a steady supply of coffee and beer. And groceries.", 10],
    ['@Kat: Today is my day of death. The day our story begins.', 10],
    ["@Charles965: Yeah so, Let's keep attacking.", 10],
    ['@Kat: The dead do not contribute to the StarBattle.', 10],
    ['@Charles965: Shutup Meg!!!', 10],
  ];

  class UIController extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.timeout_ = 0.0;
      this.textArea_ = document.getElementById('chat-ui-text-area');
      this.text_ = null;
    }

    AddText(txt) {
      if (this.text_) {
        this.text_ = null;
      }

      this.text_ = document.createElement('DIV');
      this.text_.className = 'chat-text';
      this.text_.innerText = txt;
      this.text_.classList.toggle('fadeOut');

      this.textArea_.appendChild(this.text_);

      const dead = [];
      for (let i = 0; i < this.textArea_.children.length; ++i) {
        const s = window.getComputedStyle(this.textArea_.children[i]);
        if (s.visibility == 'hidden') {
          dead.push(this.textArea_.children[i]);
        }
      }
      for (let d of dead) {
        this.textArea_.removeChild(d);
      }
    }

    Update(timeElapsed) {
      if (_PHRASES.length == 0) {
        return;
      }

      this.timeout_ -= timeElapsed;
      if (this.timeout_ < 0) {
        const [phrase, timeout] = _PHRASES.shift();
        this.timeout_ = timeout;
        this.AddText(phrase);
        return;
      }
    }
  };

  return {
    UIController: UIController,
  };

})();