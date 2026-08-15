import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: 'export',
    basePath: '/smmacdonald',
    turbopack: {
        rules: {
            "*.graphql": {
                loaders: ["@graphql-tools/webpack-loader"],
            },
            "*.gql": {
                loaders: ["@graphql-tools/webpack-loader"],
            },
        },
    },
    sassOptions: {
        quietDeps: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'macdonaldesign.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    devIndicators: false,
}

export default nextConfig