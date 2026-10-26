# Inter Tight (site webfont)

Trimmed copies of `@fontsource-variable/inter-tight` (OFL, see `OFL.txt`), referenced from `src/styles/global.css`.
Only the upright face, and the weight axis is cut to 400–700 (every weight the CSS uses), which saves ~25%.

| File | Covers | Loaded on |
| --- | --- | --- |
| `inter-tight-latin.woff2` | Basic Latin, Latin-1, punctuation | every page |
| `inter-tight-romanian.woff2` | Ă ă Ș ș Ț ț (and cedilla Ş ş Ţ ţ), plus ƒ for the viewfinder HUD | inlined into the CSS (under 4 KB), so never a separate request |
| `inter-tight-cyrillic.woff2` | Russian | RU pages |
| `inter-tight-latin-ext.woff2`, `inter-tight-cyrillic-ext.woff2` | everything else | only if content uses such a letter |

Regenerate (Python with `fonttools brotli` in a venv; F = node_modules/@fontsource-variable/inter-tight/files):

```sh
for s in latin cyrillic latin-ext cyrillic-ext; do
  fonttools varLib.instancer $F/inter-tight-$s-wght-normal.woff2 wght=400:700 -o inter-tight-$s.woff2
done
pyftsubset $F/inter-tight-latin-ext-wght-normal.woff2 --unicodes="U+0102-0103,U+015E-015F,U+0162-0163,U+0192,U+0218-021B" \
  --layout-features='*' --flavor=woff2 --output-file=ro.woff2
fonttools varLib.instancer ro.woff2 wght=400:700 -o inter-tight-romanian.woff2
```

The OG share-card generator does not use these; it reads the TTFs in `src/assets/og-fonts/`.
