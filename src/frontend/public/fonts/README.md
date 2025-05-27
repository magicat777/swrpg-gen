# Custom Fonts Directory

## Adding Your Custom Star Wars Font

1. **Download your chosen Star Wars font** (e.g., Star Jedi, Aurebesh, etc.)

2. **Convert to web formats** (optional but recommended):
   - Use online converters to create .woff2 and .woff versions
   - Keep original .ttf/.otf as fallback

3. **Rename your font files** to match the CSS:
   - `StarWarsCustom.woff2`
   - `StarWarsCustom.woff` 
   - `StarWarsCustom.ttf`
   - `StarWarsCustom-Bold.woff2` (if bold variant exists)
   - `StarWarsCustom-Bold.woff`
   - `StarWarsCustom-Bold.ttf`

4. **Update the CSS** in `/src/styles/fonts.css`:
   - Change the `font-family` name if desired
   - Update file paths to match your font names

5. **Update theme reference** in `/src/styles/theme.ts`:
   - Change `"StarWarsCustom"` to your font family name

## Popular Star Wars Fonts

- **Star Jedi** - Classic Star Wars logo style
- **Aurebesh** - In-universe Star Wars alphabet
- **Death Star** - Geometric, futuristic
- **Distant Galaxy** - Outlined Star Wars style
- **Trade Gothic Bold** - Professional Star Wars text

## Current Setup

The system is configured to use:
1. **StarWarsCustom** (your custom font)
2. **Orbitron** (Google Fonts fallback)
3. **Times New Roman** (system fallback)

Place your font files in this directory and they'll be automatically served to the frontend.