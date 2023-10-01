import { Component, Stylesheet } from '../component';
import templite from 'templite';

class ListPage extends Component {
  constructor(stylesheet: Stylesheet) {
    super(stylesheet);
    this.loadTemplate('ListPage');
  }

  render(children: { render: () => string }[]) {
    return templite(this.template.html, {
      children: children.map((child) => child.render()).join('\n'),
    });
  }
}

export default ListPage;
