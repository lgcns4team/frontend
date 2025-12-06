import { useState, useEffect } from "react";
import { fetchMenus } from "../api/MenuApi";
import type { MenuItem } from "../types/index";

export const CATEGORIES = ["추천메뉴", "커피", "음료", "디저트"];

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMenus();
        setItems(data);
      } catch (error) {
        console.error("메뉴 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return { items, isLoading, categories: CATEGORIES };
}