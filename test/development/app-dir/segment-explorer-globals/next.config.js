/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  experimental: {
    devtoolNewPanelUi: true,
    authInterrupts: true,
    globalNotFound: true,
  },
}

module.exports = nextConfig
