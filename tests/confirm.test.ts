/**
 * `heldout confirm`: the guesses the probe showed were right lose their TODO(harden) marks, wherever in a comment the
 * mark sits, and the code stays exactly as it is.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import path from 'node:path';
import { commentsOf, inFolder, withoutMarks } from '../.github/scripts/authoring/confirm';

describe('the frozen draft', () => {
  it('is told apart from the hardened copy, whatever a file is named', () => {
    const tests = path.resolve('output', 'shop', 'ABC-1', '3-tests');
    assert.ok(inFolder(tests, path.join(tests, 'abc-1.spec.ts')));
    assert.ok(inFolder(tests, path.join(tests, '..x.spec.ts')), 'a name starting with two dots is still inside');
    assert.ok(!inFolder(tests, path.resolve('output', 'shop', 'ABC-1', '4-hardening', 'abc-1.spec.ts')));
    assert.ok(!inFolder(tests, path.resolve('journeys', 'fixtures', 'shop.ts')));
    assert.ok(!inFolder(tests, tests), 'the folder itself is no file in it');
  });
});

const M = 'TODO(harden)';

describe('heldout confirm', () => {
  it('removes a mark on a line of its own, after code, and in the middle of a comment', () => {
    const src = [
      `// ${M}: the route is a guess`,
      `const ROUTE = '/checkout'; // ${M}: guessed`,
      `// Whether an item is in stock: its flag. ${M} the field name is a guess`,
      'const field = "in_stock";',
    ].join('\n');
    const { out, removed, left } = withoutMarks(src);
    assert.deepEqual([removed, left], [3, 0]);
    assert.equal(out, ["const ROUTE = '/checkout';", '// Whether an item is in stock: its flag.', 'const field = "in_stock";'].join('\n'));
  });

  it('removes a mark inside a block comment, keeping the comment and its close', () => {
    const src = ['/**', ' * Opens the cart page.', ` * ${M}: the route`, ' */', `export const x = 1; /* ${M} guessed */`, `/** ${M} */`, 'const y = 2;',
      '/*', ` * ${M} g */`, 'const z = 3;'].join('\n');
    const { out, removed } = withoutMarks(src);
    assert.equal(removed, 4);
    assert.equal(out, ['/**', ' * Opens the cart page.', ' */', 'export const x = 1;', 'const y = 2;', 'const z = 3;'].join('\n'));
  });

  it('never touches code: marks, // and /* in strings, templates, regular expressions and globs', () => {
    const code = [
      `const u = 'https://host/${M}';`,
      `const s = 'a // b ${M}';`,
      `const o = '/* ${M}';`,
      `const t = \`// ${M} \${x}\`;`,
      "await page.route('**/api/*', h);",
      `const later = 'x. ${M}';`,
      `const r = /\\/\\/ ${M.replace(/[()]/g, '\\$&')}/;`,
      `const n = \`a \${f({ k: '}' })} // ${M}\`;`,
    ].join('\n');
    const { out, removed, left } = withoutMarks(code);
    assert.equal(out, code, 'byte for byte');
    assert.deepEqual([removed, left], [0, 6], 'six literal marks, all in code (the regular expression escapes its own)');
  });

  it('tells a string mark from a comment mark on the same line', () => {
    const { out, removed, left } = withoutMarks(`const s = '${M}'; // ${M} guess`);
    assert.deepEqual([removed, left], [1, 1]);
    assert.equal(out, `const s = '${M}';`);
  });

  it('never changes what code means: a lone operator line, a comment between statements, a regex after if (…)', () => {
    // A line comment after a multiplication operator: the `*` is code and stays.
    assert.equal(withoutMarks(`const v = a\n  * // ${M}\n  b;`).out, 'const v = a\n  *\n  b;');
    // An emptied block comment spanning lines between code: kept, so the line break stays.
    assert.equal(withoutMarks(`return /*\n ${M}\n */ 1;`).out, 'return /*\n */ 1;');
    // A regular expression right after a condition is not a division.
    const code = `if (ok) /\\/\\/ ${M}/.test(s);`;
    assert.deepEqual(withoutMarks(code), { out: code, removed: 0, left: 1 });
    // A multiplication operator beside a block comment is code and stays.
    assert.equal(withoutMarks(`const v = a\n  * /* ${M} */\n  b;`).out, 'const v = a\n  *\n  b;');
    assert.equal(withoutMarks(`const v = a\n  /* ${M} */ *\n  b;`).out, 'const v = a\n *\n  b;', 'only the comment and the space before it go');
    assert.equal(withoutMarks(`/* ${M}\n */ *\n b`).out, ' *\n b');
    // A method named like a keyword is no condition: what follows its call is a division.
    for (const s of [`x.if(ok) / 2; s = '/ // ${M}';`, `t.for(x) / y; s = '/ // ${M}';`, `o?.while(z) / 2; s = '/ // ${M}';`]) assert.equal(withoutMarks(s).out, s, s);
    // `for await (…)` is a condition like `for (…)`.
    const loop = `for await (const x of y) /[//] ${M}/.test(x);`;
    assert.equal(withoutMarks(loop).out, loop);
  });

  it('keeps CRLF line endings as they are', () => {
    const src = `a(); // ${M} g\r\nb();\r\n// ${M}\r\nc(); /* ${M} */\r\nd();\r\n`;
    assert.equal(withoutMarks(src).out, 'a();\r\nb();\r\nc();\r\nd();\r\n');
  });

  it('finds comments only where the code has them', () => {
    const src = "const a = '//no'; // yes\nconst b = `/*no*/ ${c /* yes */}`;\nconst re = /\\/*/g; /* yes */";
    assert.deepEqual(commentsOf(src).map((c) => src.slice(c.start, c.end)), ['// yes', '/* yes */', '/* yes */']);
  });
});
