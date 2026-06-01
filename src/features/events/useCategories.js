import { useEffect, useState } from 'react';
import { axiosInstance } from '@/api';

// Icon mặc định khi category chưa có icon_url (file nằm trong public/icons/categories)
export const DEFAULT_CATEGORY_ICON = '/icons/categories/default.svg';

/**
 * Trả về src icon cho 1 category.
 * icon_url được BE lưu dưới dạng đường dẫn tương đối tới folder FE
 * (vd: "/icons/categories/nhac-song.svg"), nên dùng trực tiếp làm <img src>.
 */
export const categoryIconSrc = (category) =>
  category?.iconUrl?.trim() ? category.iconUrl : DEFAULT_CATEGORY_ICON;

// Cache ở mức module: categories gần như tĩnh, tránh fetch lại mỗi lần mount.
let cache = null;
let inflight = null;

const fetchCategories = () => {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = axiosInstance
      .get('/categories')
      .then((res) => {
        cache = Array.isArray(res.data) ? res.data : [];
        return cache;
      })
      .catch(() => [])
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

/**
 * Lấy danh sách category active từ BE (GET /api/categories).
 * Dùng chung cho Header và EventListPage để không hardcode danh mục.
 */
export default function useCategories() {
  const [categories, setCategories] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;
    if (cache) {
      setCategories(cache);
      setLoading(false);
      return undefined;
    }
    fetchCategories().then((data) => {
      if (active) {
        setCategories(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { categories, loading };
}
