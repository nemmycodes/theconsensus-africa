-- Helper: insert wards by LGA name (state=Plateau)
DO $$
DECLARE
  rec RECORD;
  ward_name TEXT;
  lga_uuid UUID;
  ward_data JSONB := '{
    "JOS SOUTH": ["Bukuru","Du","Giring","Gyel","Kuru","Shen","Turu","Vwang","Zawan"],
    "KANAM": ["Birbyang","Dengi","Gagdi","Garga","Gumsher","Gwamlar","Jarmai","Kanam","Kantana","Kunkyam","Munga Lelau","Munga Liere","Mwanti","Namaran","Nyalum"],
    "KANKE": ["Ampang West","Amper","Bwall","Garram","Kabwir","Langshi","Nemel","Pai"],
    "LANGTANG NORTH": ["Funyallang","Jat","Kuffen","Lipchok","Pajat","Pil-Gani","Reak","Wokat","Zamko","Lashel"],
    "LANGTANG SOUTH": ["Fajul","Lashel","Magama","Mban","Sabon Gida","Talgwang","Timbol"],
    "MANGU": ["Ampang East","Chakfem-Mushere","Gindiri","Jannaret","Jipal","Kadunu","Kerang","Kombun","Langai","Mangu","Mangu Halle","Mangun","Panyam","Pushit","Vodni"],
    "MIKANG": ["Baltep","Garkawa Central","Garkawa North","Garkawa South","Koenoem","Lalin","Piapung","Tunkus"],
    "PANKSHIN": ["Chip","Dok-Pai","Fier","Jiblik","Kadung-Pe","Kangshu","Lankan","Pankshin Central","Pankshin North","Tal","Wokkos"],
    "QUA''AN PAN": ["Bwall","Doemak","Doka","Goeskom","Kurgwi","Kwa","Kwalla","Kwande","Kwang","Lalin","Moeda","Namu","Pangshom"],
    "RIYOM": ["Attakar","Bum","Danto","Jol","Riyom","Ras","Sharubutu","Sopp","Ta-Hoss","Tahosshe"],
    "SHENDAM": ["Derteng","Kalong","Moeda","Pangshom","Poeship","Shendam Central","Shendam East","Shendam North","Shimangkar","Yelwa"],
    "WASE": ["Bashar","Danbiram","Gimbi","Kadarko","Kumbur","Kurmi","Lamba","Mavo","Nyalum","Saluwe","Wadata","Wase","Yola"]
  }';
BEGIN
  FOR rec IN SELECT * FROM jsonb_each(ward_data) LOOP
    SELECT id INTO lga_uuid FROM public.inec_lgas
      WHERE state='Plateau' AND name = rec.key
      LIMIT 1;
    IF lga_uuid IS NULL THEN CONTINUE; END IF;
    -- Skip if wards already exist for this LGA
    IF EXISTS (SELECT 1 FROM public.inec_wards WHERE lga_id = lga_uuid) THEN
      CONTINUE;
    END IF;
    FOR ward_name IN SELECT jsonb_array_elements_text(rec.value) LOOP
      INSERT INTO public.inec_wards (lga_id, name, code)
      VALUES (
        lga_uuid,
        ward_name,
        upper(left(rec.key, 3)) || '-' || upper(regexp_replace(ward_name, '[^A-Za-z0-9]', '', 'g'))
      );
    END LOOP;
  END LOOP;
END $$;