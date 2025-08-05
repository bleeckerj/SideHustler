// TransformationList.js: Handles cycling through LLM outputs
export class TransformationList {
  constructor(texts) {
    this.texts = texts || [];
    this.index = 0;
  }
  current() {
    return this.texts[this.index] || '';
  }
  next() {
    if (this.index < this.texts.length - 1) this.index++;
    return this.current();
  }
  prev() {
    if (this.index > 0) this.index--;
    return this.current();
  }
  setTexts(texts) {
    this.texts = texts;
    this.index = 0;
  }
}
