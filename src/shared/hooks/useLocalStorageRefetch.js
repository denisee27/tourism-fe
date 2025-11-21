import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * useLocalStorageRefetch
 * Mendengarkan perubahan localStorage & custom event `${key}:changed`
 * lalu meng-invalidate Tanstack Query untuk refetch.
 *
 * @param {Object} params
 * @param {string} params.key - Nama key localStorage yang dipantau
 * @param {Array<string|Array>} params.queryKeys - Daftar queryKey (string atau array) untuk di-invalidate
 * @param {Function} [params.onChange] - Callback dengan nilai terbaru
 */
export const useLocalStorageRefetch = ({ key, queryKeys = [], onChange }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const normalizeKey = (k) => (Array.isArray(k) ? k : [k]);
    const invalidateAll = () => {
      for (const k of queryKeys) {
        queryClient.invalidateQueries({ queryKey: normalizeKey(k) });
      }
    };

    const handleValueChange = (newValue) => {
      try {
        invalidateAll();
        if (onChange) onChange(newValue);
      } catch (err) {
        console.warn("useLocalStorageRefetch error", err);
      }
    };

    const onStorage = (e) => {
      if (e.key === key) {
        handleValueChange(e.newValue);
      }
    };

    const onCustom = (e) => {
      const detailVal = e?.detail?.[key];
      const next = detailVal !== undefined ? detailVal : localStorage.getItem(key);
      handleValueChange(next);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(`${key}:changed`, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(`${key}:changed`, onCustom);
    };
  }, [key, queryKeys, queryClient, onChange]);
};