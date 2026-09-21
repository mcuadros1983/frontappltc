const STORAGE_KEY = "erp_recent_navigation";
const MAX_RECENTS = 6;

export const getRecentNavigation = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const data = JSON.parse(raw);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[recentNavigation] Error leyendo recientes:", error);
    return [];
  }
};

export const addRecentNavigation = ({ path, label }) => {
  if (!path || !label) return;

  try {
    const actuales = getRecentNavigation();

    // Si ya existe, lo eliminamos para volver a ponerlo primero.
    const sinDuplicado = actuales.filter(
      (item) => item.path !== path
    );

    const nuevos = [
      {
        path,
        label,
        visitedAt: Date.now(),
      },
      ...sinDuplicado,
    ].slice(0, MAX_RECENTS);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nuevos)
    );

    // Actualiza ShortcutsBar inmediatamente.
    window.dispatchEvent(
      new CustomEvent("erp-recent-navigation-updated")
    );
  } catch (error) {
    console.error("[recentNavigation] Error guardando reciente:", error);
  }
};

export const clearRecentNavigation = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);

    window.dispatchEvent(
      new CustomEvent("erp-recent-navigation-updated")
    );
  } catch (error) {
    console.error("[recentNavigation] Error limpiando recientes:", error);
  }
};