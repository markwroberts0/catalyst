/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', // localhost
        'probable-goggles-7v59g69jpj93pvqv.github.dev', // Codespaces
        'https://catalyst-lac.vercel.app/', // Vercel
        'https://catalyst-9dmtzxw8g-markwroberts0s-projects.vercel.app/', // Vercel
      ],
    },
  }
}
