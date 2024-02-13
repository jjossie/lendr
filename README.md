# Lendr - Community Tool Lending Platform

Lendr is a cross-platform mobile application enabling users to list their tools for rental within their local community.

![Lendr Logo](https://github.com/jjossie/lendr/blob/main/mobile-app/assets/lendr-logo-square-v2-2.png?raw=true)

## Overview

Many people purchase tools to build, fix, and work on things in their homes and cars, and end up with a collection of tools that end up not getting used very often. Rather than viewing tool purchases as a consumption where a specific tool gets purchase for a single job, then never gets used again, Lendr seeks to turn these tools into investments by allowing users to rent them out to people for a small fee. Lendr will provide a platform for tool owners to list their tools available for rent, while those who need a tool for a job but don’t want to buy it can browse local listings and find the tool they’re looking for.


There are two target audiences for Lendr: 
1) tool owners looking to make some extra cash
2) generally handy people who need tools but don’t want to buy them

Lendr seeks to be the best platform for these audiences to connect and fill both of their needs.

The Lendr app provides an interface for lenders to add tools they own to their inventory by snapping a photo of them and providing details such as an hourly, daily, or weekly rental rate. These rental listings will then be made available and searchable to end users – potential borrowers – who will have listings shown to them based on location.

# Tech Stack & Development Environment/Tooling

- Backend:
  - Firebase
    - Cloud Firestore
    - Cloud Functions
    - Storage
    - Authentication
  - Algolia (Full-text search)
- Frontend:
  - React Native
  - Native Base
- Languages:
  - TypeScript / TSX
  - CSS
  - HTML
- IDEs:
  - Jetbrains WebStorm
  - Visual Studio Code
- Build Tools / Environment:
  - yarn
  - expo


# What's next?

There's a lot left to do, all of which is documented in a private Trello board. In the short term, there is a good amount of work to do to stabilize the app:
- UI Tweaks
- Bug Fixes
- Backend refactoring

The long-term vision for Lendr includes implementing several new features and, of course, a release onto the iOS App Store and Google Play Store. There are significant business considerations involved, however, so for now the project continues its long-term development here until a plan for rollout is put in place.

