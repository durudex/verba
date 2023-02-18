# `verba-compare`

Structural comparison of two values.

## Examples

```ts
import {compare} from 'verba-compare'

compare({}, {}) // true
compare([1, 0], [0, 1]) // false
```

See [tests](./test/compare.test.ts) for more examples.

## ⚠️ License

Copyright © 2022 [Durudex](https://github.com/durudex). Released under the MIT license.
