import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* Import Google Fonts for Star Wars-like typography */
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Exo+2:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    --font-logo: ${({ theme }) => theme.typography.fontFamily.logo};
    --font-crawl: ${({ theme }) => theme.typography.fontFamily.crawl};
    --font-title: ${({ theme }) => theme.typography.fontFamily.title};
    --font-primary: ${({ theme }) => theme.typography.fontFamily.primary};
    --font-secondary: ${({ theme }) => theme.typography.fontFamily.secondary};
    --font-cinematic: ${({ theme }) => theme.typography.fontFamily.cinematic};
    --font-technical: ${({ theme }) => theme.typography.fontFamily.technical};
    --font-lore: ${({ theme }) => theme.typography.fontFamily.lore};
    --font-monospace: ${({ theme }) => theme.typography.fontFamily.monospace};
  }

  /* Reset and base styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.neutral.text};
    background-color: ${({ theme }) => theme.colors.neutral.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* Star Wars Typography Hierarchy */
  h1, h2, h3, h4, h5, h6 {
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  /* Main Page Titles - Star Wars Logo Style */
  h1 {
    font-family: ${({ theme }) => theme.typography.fontFamily.logo};
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.black};
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Section Headers - Film Title Style */
  h2 {
    font-family: ${({ theme }) => theme.typography.fontFamily.title};
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    letter-spacing: 0.02em;
  }

  /* Subsection Headers - Opening Crawl Style */
  h3 {
    font-family: ${({ theme }) => theme.typography.fontFamily.crawl};
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  /* Component Headers */
  h4 {
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }

  /* Minor Headers */
  h5 {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  /* Small Headers */
  h6 {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.lightSide.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.effects.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.lightSide.secondary};
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.lightSide.primary};
      outline-offset: 2px;
    }
  }

  /* Form elements */
  button, input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    transition: ${({ theme }) => theme.effects.transition.fast};

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  input, textarea, select {
    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.lightSide.primary};
      outline-offset: 2px;
    }
  }

  /* Lists */
  ul, ol {
    padding-left: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral.accent};
    border-radius: ${({ theme }) => theme.effects.borderRadius.full};

    &:hover {
      background: ${({ theme }) => theme.colors.neutral.secondary};
    }
  }

  /* Focus styles for accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Utility classes */
  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .w-full {
    width: 100%;
  }

  .h-full {
    height: 100%;
  }

  /* Star Wars Typography Utility Classes */
  .sw-logo {
    font-family: ${({ theme }) => theme.typography.fontFamily.logo};
    font-weight: ${({ theme }) => theme.typography.fontWeight.black};
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .sw-title {
    font-family: ${({ theme }) => theme.typography.fontFamily.title};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    letter-spacing: 0.02em;
  }

  .sw-crawl {
    font-family: ${({ theme }) => theme.typography.fontFamily.crawl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }

  .sw-technical {
    font-family: ${({ theme }) => theme.typography.fontFamily.technical};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .sw-cinematic {
    font-family: ${({ theme }) => theme.typography.fontFamily.cinematic};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    letter-spacing: 0.05em;
  }

  .sw-lore {
    font-family: ${({ theme }) => theme.typography.fontFamily.lore};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }

  /* Dark mode support for system preference */
  @media (prefers-color-scheme: dark) {
    body {
      color: ${({ theme }) => theme.colors.neutral.surface};
      background-color: ${({ theme }) => theme.colors.darkSide.background};
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Print styles */
  @media print {
    body {
      background: white;
      color: black;
    }

    * {
      box-shadow: none !important;
    }
  }
`;