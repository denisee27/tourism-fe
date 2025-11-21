export const formatDateLabel = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return iso;
  }
};

export default formatDateLabel;
