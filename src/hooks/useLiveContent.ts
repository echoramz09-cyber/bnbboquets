/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SiteSettings, Category, Product, CarouselImage } from "../types";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, "siteSettings", "global"), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as SiteSettings);
      }
    });
  }, []);

  return settings;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("order", "asc"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      setCategories(data);
    });
  }, []);

  return categories;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("order", "asc"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(data);
    });
  }, []);

  return products;
}

export function useCarouselImages() {
  const [images, setImages] = useState<CarouselImage[]>([]);

  useEffect(() => {
    const q = query(collection(db, "carousel"), orderBy("order", "asc"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CarouselImage[];
      setImages(data);
    });
  }, []);

  return images;
}
