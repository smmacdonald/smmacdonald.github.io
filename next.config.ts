import type { NextConfig } from "next"
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
    output: 'export',
    basePath: isProd ? '/smmacdonald' : '',
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