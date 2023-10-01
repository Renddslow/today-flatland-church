import { Component, Stylesheet } from '../component';
import templite from 'templite';

class Form extends Component {
  constructor(stylesheet: Stylesheet) {
    super(stylesheet);
    this.loadTemplate('Form');
  }

  render() {
    // TODO: make this configurable
    return templite(this.template.html, {});
  }
}

export default Form;
