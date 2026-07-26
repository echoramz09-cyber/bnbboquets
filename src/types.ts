/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HeroContent {
  title: string;
  subtitle: string;
}

export interface FooterContent {
  tagline: string;
  copyright: string;
}

export interface SiteSettings {
  hero: HeroContent;
  footer: FooterContent;
  logo: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  tag: string;
  categoryId: string;
  order: number;
}

export interface CarouselImage {
  id: string;
  image: string;
  order: number;
}
