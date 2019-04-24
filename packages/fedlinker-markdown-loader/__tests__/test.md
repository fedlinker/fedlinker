# Document

Paragraph.

## Examples

### Basic

```
Code.
```

### JSX

```jsx
import React from 'react';
export default () => <button>Button</button>;
```

### 在线示例

#### Imports

```js @run
import 'module-name';
import defaultName from 'module-name';
import * as namespace from 'module-name';
import { export1, export2 as export2Alias } from 'module-name';
export default () => null;
```

#### Button

```jsx @run
import { Component } from 'react';

class Button extends Component {
  render() {
    return <button>Button</button>;
  }
}

export default Button;
```
