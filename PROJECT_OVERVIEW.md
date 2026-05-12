# Loom Project Overview

## What is Loom?
Loom is a Smart Wardrobe Assistant designed to digitize a user's closet and provide AI-powered outfit recommendations. It helps users maximize their wardrobe, track laundry, and save cohesive outfits to a personal lookbook.

## Core Features
1. **Digital Closet:** Users can upload or capture photos of their clothing.
2. **AI Classification:** The app automatically determines the category, color palette, formality, season, and vibe of the clothing item.
3. **Stylist Engine:** Generates complete outfits (Top, Bottom, Footwear) based on color theory, weather, and occasion.
4. **Laundry & Favorites:** Items can be marked as dirty (which excludes them from Stylist AI suggestions) or favorited.
5. **Lookbook:** Curated outfits can be saved for future reference.
6. **Analytics Dashboard:** Provides a visual breakdown of the wardrobe composition.

## Purpose of the System
Loom bridges the gap between what people own and what they actually wear. By having a digitized version of a wardrobe combined with a smart AI stylist, users avoid "decision fatigue" and stop purchasing unnecessary duplicates.

## Key Stakeholders
- **Users:** Individuals wanting to organize their wardrobe.
- **Recruiters/Reviewers:** Looking at the project for code quality, architectural decisions, and production readiness.

## Evolution
Loom initially started with a hybrid fallback architecture where a local Express server managed files and data if Firebase failed. To make it strictly production-ready, the fallback architecture has been completely removed. The app now relies 100% on Firebase for robust cloud storage and state management, providing a cleaner and more scalable codebase.
