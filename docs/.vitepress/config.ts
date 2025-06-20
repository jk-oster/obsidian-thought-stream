import { defineConfig, HeadConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Whisper Buddy",
  description: "A plugin for Obsidian to explore your ideas, express your thoughts and create useful content effortlessly.",
  lastUpdated: true,

  transformHead: ({ pageData }) => {
    const head: HeadConfig[] = []

    head.push(['meta', { property: 'og:title', content: pageData.frontmatter?.title ?? '' }])
    head.push(['meta', { property: 'og:description', content: pageData.frontmatter?.description ?? '' }])
    head.push(['link', { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '128x128' }])
    head.push(['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }])
    head.push(['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }])
    head.push(['link', { rel: 'shortcut icon', href: '/favicon.ico' }])
    head.push(['link', { rel: 'manifest', href: '/site.webmanifest' }])
    head.push(['script', { id: 'matomo', src: '/matomo.js' }])

    return head
  },

  base: '/obsidian-thought-stream/',
  sitemap: {
    hostname: 'https://jk-oster.github.io/obsidian-thought-stream/',
    // hostname: 'https://vaultlens.com'
  },
  
  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {

    editLink: {
      pattern: 'https://github.com/jk-oster/obsidian-thought-stream/edit/master/docs/:path'
    },

    search: {
      provider: 'local'
    },
    logo: '/ghost.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Feature Guide', link: '/feature-guide' },
      { text: 'Install', link: 'obsidian://show-plugin?id=whisper-buddy' },
      { text: 'Creator', link: 'https://www.jakobosterberger.com' }
    ],

    sidebar: [
      {
        // text: 'Guide',
        items: [
          { text: 'Why?', link: '/why' },
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Feature Guide', link: '/feature-guide' },
          { text: 'FAQ & Troubleshooting', link: '/faq' },
          { text: 'Roadmap', link: '/roadmap' },
          // { text: 'Privacy & Permissions', link: '/privacy' },
          { text: 'Credits', link: '/credits' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jk-oster/obsidian-thought-stream' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Jakob Osterberger'
    }
  },
})
