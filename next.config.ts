import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "export",
    distDir: process.env.NEXT_DIST_DIR ?? ".next",
    basePath: process.env.BASE_PATH ?? "",
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
                protocol: "https",
                hostname: "macdonaldesign.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
    devIndicators: false,
}

export default nextConfig
