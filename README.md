# Personal Portfolio — Next.js + Drupal 11

A modern personal portfolio built with **Next.js** and powered by **Drupal 11**. The project uses Drupal as a headless content management system and Next.js as the frontend presentation layer, bringing together content from my personal portfolio and presenting it as a fast, responsive website hosted on **GitHub Pages**.

## Overview

This project demonstrates how a modern Next.js application can consume content from a Drupal 11 backend through both **GraphQL** and the **REST API**.

Drupal manages the portfolio content and structured data, while Next.js is responsible for retrieving, transforming, and displaying that information in the frontend.

The result is a decoupled architecture that combines Drupal's powerful content management capabilities with Next.js's modern React-based frontend and static site generation.

### Architecture

```text
                    Drupal 11
                 Headless CMS
                      │
              ┌───────┴────────┐
              │                │
          GraphQL           REST API
              │                │
              └───────┬────────┘
                      │
                      ▼
                  Next.js
               React Frontend
                      │
             Static Generation
                      │
                      ▼
                GitHub Pages
```

## What This Project Does

The application pulls information from my personal portfolio stored in Drupal and uses that content to build the website.

Depending on the content type, Next.js can retrieve information such as:

* Personal and professional information
* About/profile content
* Projects and case studies
* Skills and technologies
* Work experience
* Education
* Contact information
* Other structured portfolio content managed through Drupal

Rather than hard-coding this information into the Next.js application, Drupal acts as the source of truth. This makes the frontend easier to maintain while allowing content to be managed independently from the presentation layer.

## Technologies

* **Next.js** — React framework and frontend application
* **React** — UI development
* **Drupal 11** — Headless CMS and content management
* **GraphQL** — Structured content queries
* **REST API** — API access for Drupal resources and content
* **GitHub Pages** — Static hosting
* **GitHub Actions** — Automated builds and deployment

## Drupal 11 Integration

Drupal 11 serves as the backend for the portfolio.

Content is modeled in Drupal and exposed through APIs that the Next.js application consumes. This creates a separation between the content management system and the frontend application.

### GraphQL

GraphQL is used when the frontend needs specific, structured data from Drupal.

Instead of requesting an entire resource, the application can query only the fields it needs. This works particularly well for portfolio content where different pages may require different combinations of data.

For example, a project page might retrieve:

```text
Project
├── Title
├── Description
├── Image
├── Technologies
├── Project URL
└── Date
```

This approach keeps data requests focused and allows the Next.js components to work with predictable content structures.

### REST API

The Drupal REST API provides another way for the application to interact with Drupal.

REST can be useful for resources or Drupal endpoints where a traditional API response is more appropriate than a GraphQL query.

Using both GraphQL and REST allows the project to demonstrate different approaches to consuming Drupal content rather than relying on a single integration method.

## Next.js Frontend

Next.js provides the presentation layer for the portfolio.

The application retrieves content from Drupal and transforms that content into pages and reusable React components.

The frontend is responsible for:

* Rendering portfolio content
* Creating responsive layouts
* Providing navigation and page structure
* Optimizing images and assets
* Generating static pages
* Providing a modern user experience

Because the site is intended to run on GitHub Pages, the project is configured around a static deployment model rather than requiring a continuously running Node.js server.

## GitHub Pages Deployment

The Next.js application is built and deployed as a static site to GitHub Pages.

The general deployment flow is:

```text
Push to GitHub
      │
      ▼
GitHub Actions
      │
      ▼
Next.js Build
      │
      ▼
Static Export
      │
      ▼
GitHub Pages
```

This allows the portfolio to be hosted without maintaining a traditional application server.

## Why Drupal + Next.js?

Using Drupal and Next.js together provides a useful separation of responsibilities:

**Drupal handles the content.**

It provides structured content modeling, administration, and API access.

**Next.js handles the presentation.**

It provides the React-based interface, routing, component architecture, and static site generation.

This decoupled approach makes it possible to change the frontend without rebuilding the content management system, or to update portfolio content without changing the frontend code.

## Project Structure

A simplified view of the application might look like:

```text
.
├── app/
│   ├── components/
│   ├── projects/
│   ├── about/
│   └── ...
├── assets/
├── components/
├── graphql/
├── lib/
├── src/
│   ├── utlis/
│   └── ...
├── types/
├── public/
├── next.config.js
└── package.json
```

The exact structure may evolve as the project grows.

## Getting Started

### Prerequisites

You'll need:

* Node.js
* npm, pnpm, or another supported package manager
* A Drupal 11 installation with the required API modules/configuration
* Access to the Drupal GraphQL and/or REST endpoints

### Install

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### Environment Variables

Create a local environment file and provide the Drupal API configuration required by the application.

For example:

```env
NEXT_PUBLIC_LOCAL_API_URL=https://your-drupal-site.example
NEXT_PUBLIC_LOCAL_API_GRAPHQL_URL=https://your-drupal-site.example/graphql
```

The actual variables used by the application may differ depending on the project's configuration.

### Run the Development Server

```bash
npm run dev
```

Then open the development site in your browser.

## Deployment

The project is designed to build as a static Next.js application and deploy to GitHub Pages.

A typical production build can be generated with:

```bash
npm run build
```

Deployment is handled through GitHub Actions so that changes pushed to the repository can be built and published automatically.

## Purpose

This project serves as both a personal portfolio and a demonstration of a **decoupled Drupal architecture**.

It showcases how Drupal 11 can be used as a headless CMS while Next.js provides the frontend experience, with GraphQL and REST APIs acting as the connection between the two systems.

The project also demonstrates how a content-driven Next.js site can be statically generated and deployed through GitHub Pages.

## License

This project is intended for personal and portfolio use.

See the repository for additional licensing information.
