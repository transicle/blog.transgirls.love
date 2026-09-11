---
title: everything this blog can render
date: 2026-02-20
tags: markdown, latex, meta
excerpt: a kitchen-sink post testing headers, code blocks, tables, quotes, and LaTeX math.
---

this post exists purely to test the renderer. if something looks broken here,
it's broken everywhere, so this is my canary post.

## headers, emphasis, lists

you get **bold**, _italic_, ~~strikethrough~~, and `inline code`.

- unordered lists
- nest fine
  - like this
- and this

1. ordered lists
2. work too
3. obviously

> blockquotes look like little sticky notes, which felt right for a blog like
> this one.

## code blocks

fenced code blocks get syntax highlighting automatically:

```python
def fibonacci(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print([fibonacci(i) for i in range(10)])
```

```js
const stickers = ["nyan-cat.gif", "gay.gif", "cute-anime.gif"];
stickers.forEach((s) => console.log(`loaded ${s}`));
```

## tables

| feature      | library       | notes                          |
| ------------ | ------------- | ------------------------------- |
| markdown     | marked.js     | GFM mode, tables + strikethrough |
| math         | KaTeX         | auto-renders `$...$` and `$$...$$` |
| highlighting | highlight.js  | auto-detects language            |

## LaTeX

inline math works like this: the quadratic formula is
$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$, which everyone half-remembers from
school.

block-level math gets its own centered line:

$$
\int_{-\infty}^{\infty} e^{-x^2}\, dx = \sqrt{\pi}
$$

and matrices render cleanly too:

$$
\begin{pmatrix} a & b \\ c & d \end{pmatrix}
\begin{pmatrix} x \\ y \end{pmatrix}
=
\begin{pmatrix} ax + by \\ cx + dy \end{pmatrix}
$$

that's the full toolkit. everything above is just markdown + a couple of
delimiters — no special plugins needed per-post.