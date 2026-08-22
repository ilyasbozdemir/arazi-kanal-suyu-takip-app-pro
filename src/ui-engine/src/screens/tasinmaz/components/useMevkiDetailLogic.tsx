import { useState, useEffect } from 'react';
import { TANIM_Konumlar } from '../../../types/models';
import { DOMAIN_CONFIG } from '../../../constants/domainConfig';

export const useMevkiDetailLogic = (values: any, setValues: (v: any) => void, type: string) => {
  const [allLocations, setAllLocations] = useState<TANIM_Konumlar[]>([]);
  const [availableCities, setAvailableCities] = useState<TANIM_Konumlar[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<TANIM_Konumlar[]>([]);
  const [availableTowns, setAvailableTowns] = useState<TANIM_Konumlar[]>([]);
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<TANIM_Konumlar[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);

  // 🛡️ 1. LOAD ALL LOCATIONS & SEAL DEFAULTS
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'TANIM_Konumlar');
        if (res.success && res.data) {
          const raw = res.data as TANIM_Konumlar[];
          setAllLocations(raw);
          const cities = raw.filter(l => l.Tip?.toUpperCase() === 'İL' || l.Tip?.toUpperCase() === 'IL');
          setAvailableCities(cities);

          // ✨ CORPORATE AUTOMATION: Auto-fill default location if record is new
          if (!values.Konum_id) {
             const defaultCity = DOMAIN_CONFIG.kurum.il;
             const defaultDistrict = DOMAIN_CONFIG.kurum.ilce;
             const defaultTown = DOMAIN_CONFIG.kurum.belde;

             const cityObj = raw.find(l => l.Ad === defaultCity);
             const districtObj = raw.find(l => l.Ad === defaultDistrict && l.Parent_id === cityObj?.id);
             const townObj = raw.find(l => l.Ad?.includes(defaultTown) && l.Parent_id === districtObj?.id);

             setValues((prev: any) => ({
                ...prev,
                Konum_id: townObj?.id || prev.Konum_id
             }));
          }
        }
      } catch (err) {
        console.error("Location load error:", err);
      }
    };
    loadLocations();
  }, []);

  // 🛡️ 2. HIERARCHY SYNCHRONIZATION
  useEffect(() => {
    if (allLocations.length === 0) return;

    const syncHierarchy = () => {
      if (values.Konum_id) {
        const leaf = allLocations.find(l => l.id === values.Konum_id);
        if (leaf) {
          let neighborhood: TANIM_Konumlar | null | undefined = null;
          let town: TANIM_Konumlar | null | undefined = null;
          let district: TANIM_Konumlar | null | undefined = null;
          let city: TANIM_Konumlar | null | undefined = null;
 
          if (['MAHALLE', 'KÖY', 'KOY'].includes(leaf.Tip?.toUpperCase() || '')) {
            neighborhood = leaf;
            const parent = allLocations.find(l => l.id === neighborhood?.Parent_id);
            if (parent?.Tip?.toUpperCase() === 'BELDE') {
              town = parent;
              district = allLocations.find(l => l.id === town?.Parent_id);
            } else {
              district = parent;
            }
          } else if (leaf.Tip?.toUpperCase() === 'BELDE') {
            town = leaf;
            district = allLocations.find(l => l.id === town?.Parent_id);
          }
 
          if (district) city = allLocations.find(l => l.id === district?.Parent_id);
 
          // 🛡️ Seal Filters
          if (city) setAvailableDistricts(allLocations.filter(l => (l.Tip?.toUpperCase() === 'İLÇE' || l.Tip?.toUpperCase() === 'ILCE') && l.Parent_id === city?.id));
          if (district) {
            const children = allLocations.filter(l => l.Parent_id === district?.id);
            setAvailableTowns(children.filter(l => l.Tip?.toUpperCase() === 'BELDE'));
            setAvailableNeighborhoods(children.filter(l => ['MAHALLE', 'KÖY', 'KOY'].includes(l.Tip?.toUpperCase() || '')));
          }
          if (town) setAvailableNeighborhoods(allLocations.filter(l => l.Parent_id === town?.id));

          // 🛡️ Sync Display State (Calculated from Konum_id)
          // We don't set values.Il, etc. because they are virtual now.
          // They are resolved via JOIN in the backend.
        }
      }
    };
    syncHierarchy();
  }, [allLocations, values.Konum_id]);

  // 🛡️ 3. FETCH MEVKIS (LOCATIONS) FOR SELECTED NEIGHBORHOOD
  useEffect(() => {
    const loadMevkis = async () => {
      if (!values.Konum_id) {
        setAvailableLocations([]);
        return;
      }
      try {
        const res = await (window as any).electron.ipcRenderer.invoke('get-db-data', 'DATA_Tasinmaz_Mevkileri', { Konum_id: values.Konum_id });
        if (res.success && res.data) {
          setAvailableLocations(res.data);
        }
      } catch (err) {
        console.error("Mevki load error:", err);
      }
    };
    loadMevkis();
  }, [values.Konum_id]);

  const handleCityChange = (cityName: string) => {
    const city = allLocations.find(l => l.Ad === cityName);
    const districts = city ? allLocations.filter(l => (l.Tip?.toUpperCase() === 'İLÇE' || l.Tip?.toUpperCase() === 'ILCE') && l.Parent_id === city.id) : [];
    setAvailableDistricts(districts);
    setAvailableTowns([]);
    setAvailableNeighborhoods([]);
    // 🛡️ Sadece hiyerarşiyi sıfırla, ID'yi temizle
    setValues({ ...values, Konum_id: '' });
  };

  const handleDistrictChange = (districtName: string) => {
    const district = availableDistricts.find(l => l.Ad === districtName);
    if (!district) return;

    const children = allLocations.filter(l => l.Parent_id === district.id);
    const towns = children.filter(l => l.Tip?.toUpperCase() === 'BELDE');
    const neighborhoods = children.filter(l => ['MAHALLE', 'KÖY', 'KOY'].includes(l.Tip?.toUpperCase() || ''));

    setAvailableTowns(towns);
    setAvailableNeighborhoods(neighborhoods);
    setValues({ ...values, Konum_id: '' });
  };

  const handleTownChange = (townName: string) => {
    const town = availableTowns.find(l => l.Ad === townName);
    const neighborhoods = town ? allLocations.filter(l => l.Parent_id === town.id) : [];
    setAvailableNeighborhoods(neighborhoods);
    setValues({ ...values, Konum_id: town?.id || '' });
  };

  const handleNeighborhoodChange = (neighborhoodName: string) => {
    const neighborhood = availableNeighborhoods.find(l => l.Ad === neighborhoodName);
    if (neighborhood) {
      setValues({ ...values, Konum_id: neighborhood.id });
    }
  };

  // 🛡️ Calculated names for display
  const selectedNeighborhood = allLocations.find(l => l.id === values.Konum_id && ['MAHALLE', 'KÖY', 'KOY'].includes(l.Tip?.toUpperCase() || ''));
  const selectedTown = allLocations.find(l => (l.id === values.Konum_id && l.Tip?.toUpperCase() === 'BELDE') || (selectedNeighborhood && l.id === selectedNeighborhood.Parent_id && l.Tip?.toUpperCase() === 'BELDE'));
  const selectedDistrict = allLocations.find(l => (selectedTown && l.id === selectedTown.Parent_id) || (selectedNeighborhood && !selectedTown && l.id === selectedNeighborhood.Parent_id) || (allLocations.find(x => x.id === values.Konum_id)?.Tip?.toUpperCase() === 'İLÇE' && l.id === values.Konum_id));
  const selectedCity = allLocations.find(l => selectedDistrict && l.id === selectedDistrict.Parent_id);

  return {
    availableCities, availableDistricts, availableTowns, availableNeighborhoods, availableLocations,
    handleCityChange, handleDistrictChange, handleTownChange, handleNeighborhoodChange,
    displayNames: {
      Il: selectedCity?.Ad || '',
      Ilce: selectedDistrict?.Ad || '',
      Belde: selectedTown?.Ad || '',
      Mahalle_Koy: selectedNeighborhood?.Ad || ''
    }
  };
};
