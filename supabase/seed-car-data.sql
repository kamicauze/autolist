-- Auto-generated seed data for car_makes, car_models, car_trims, car_variants
-- Paste this into the Supabase SQL editor and run it.

BEGIN;

-- Alfa Romeo
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Alfa Romeo', 'alfa-romeo', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Alfa Romeo';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Stelvio', 'stelvio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tonale', 'tonale') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Giulia', 'giulia') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Giulietta', 'giulietta') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sprint', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ti', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Veloce', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Competizione', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Estrema', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Quadrifoglio', 5) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Aston Martin
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Aston Martin', 'aston-martin', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Aston Martin';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'DBX', 'dbx') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'DB11', 'db11') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'DB12', 'db12') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vantage', 'vantage') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vanquish', 'vanquish') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Valour', 'valour') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Valkyrie', 'valkyrie') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Rapide', 'rapide') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'DBS', 'dbs') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LE', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ultimate', 3) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Audi
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Audi', 'audi', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Audi';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A1', 'a1') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A3', 'a3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A4', 'a4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A4 Allroad Quattro', 'a4-allroad-quattro') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A5', 'a5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A5 Sportback', 'a5-sportback') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A6', 'a6') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A6 Allroad', 'a6-allroad') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A6 E-Tron', 'a6-e-tron') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A7', 'a7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A8', 'a8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'E-Tron GT', 'e-tron-gt') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RS3', 'rs3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RS5', 'rs5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RS5 Sportback', 'rs5-sportback') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RS6', 'rs6') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RS6 Avant', 'rs6-avant') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RS7', 'rs7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S3', 's3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S4', 's4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S5', 's5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S5 Sportback', 's5-sportback') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S6', 's6') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S7', 's7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S8', 's8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Q3', 'q3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Q4 E-Tron', 'q4-e-tron') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Q5', 'q5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Q6 E-Tron', 'q6-e-tron') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Q7', 'q7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Q8', 'q8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Q8 E-Tron', 'q8-e-tron') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RS Q3', 'rs-q3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RS Q8', 'rs-q8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SQ5', 'sq5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SQ6 E-Tron', 'sq6-e-tron') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SQ7', 'sq7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SQ8', 'sq8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SQ8 E-Tron', 'sq8-e-tron') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Comfort', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium Plus', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Prestige', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S-Line', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'RS', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Black Edition', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'TFSI', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'TDI', 10) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Bentley
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Bentley', 'bentley', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Bentley';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Continental', 'continental') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Bentayga', 'bentayga') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Flying Spur', 'flying-spur') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Speed', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Azure', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Mulliner', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 4) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- BMW
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('BMW', 'bmw', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'BMW';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '1 Series', '1-series') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '1-series'), '116i', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '1-series'), '116d', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '1-series'), '118D', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '1-series'), '118i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '1-series'), '120i', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '1-series'), '120d', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '1-series'), '130i', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '1-series'), 'M135i', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '1-series'), 'M140i', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '2 Series', '2-series') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '216d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '218d', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '218i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '220d', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '220i', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '225d', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '225xe', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '228i', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '230i', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), '230xe', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), 'M235i', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '2-series'), 'M240i', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '3 Series', '3-series') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '316i', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '318i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '318d', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '320d', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '320i', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '323i', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '325i', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '325d', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '328i', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '330i', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '330d', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '330e', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '335d', 12) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '335i', 13) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), '340i', 14) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), 'M3', 15) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), 'M3 Competition', 16) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '3-series'), 'M3 CS', 17) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '4 Series', '4-series') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '418d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '418i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '420d', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '420i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '425d', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '428i', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '430d', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '430i', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '435i', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), '440i', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), 'M4', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), 'M4 Competition', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), 'M4 CS', 12) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), 'M4 CSL', 13) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), 'M4 GTS', 14) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '4-series'), 'M440i', 15) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '5 Series', '5-series') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '518d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '518i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '520d', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '520i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '523i', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '525d', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '525i', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '528i', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '530d', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '530e', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '530i', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '535d', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '535i', 12) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '540d', 13) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '540i', 14) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '545e', 15) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '550e', 16) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), '550i', 17) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), 'i5 eDrive40', 18) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), 'i5 M60', 19) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), 'M5', 20) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), 'M5 Competition', 21) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '5-series'), 'M5 CS', 22) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '6 Series', '6-series') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '6-series'), '620d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '6-series'), '630d', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '6-series'), '630i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '6-series'), '635d', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '6-series'), '640d', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '6-series'), '640i', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '6-series'), '645Ci', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '6-series'), '650i', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '6-series'), 'M6', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '7 Series', '7-series') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '725d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '728i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '730d', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '730i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '735i', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '740d', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '740e', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '740i', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '745d', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '745e', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '745i', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '750d', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '750e', 12) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '750i', 13) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), '760i', 14) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), 'i7 eDrive50', 15) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), 'i7 M70', 16) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), 'M760e', 17) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '7-series'), 'M760i', 18) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '8 Series', '8-series') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '8-series'), '840d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '8-series'), '840i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '8-series'), '850i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '8-series'), 'M8', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '8-series'), 'M8 Competition', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '8-series'), 'M850i', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X1', 'x1') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'sDrive18i', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'sDrive20i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'xDrive23i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'xDrive28i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'M35i', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'sDrive18d', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'xDrive20d', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'xDrive25e', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'iX1 eDrive20', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x1'), 'iX1 xDrive30', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X2', 'x2') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x2'), 'sDrive18i', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x2'), 'sDrive20i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x2'), 'xDrive28i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x2'), 'M35i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x2'), 'sDrive18d', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x2'), 'xDrive20d', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x2'), 'xDrive25d', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x2'), 'iX2 eDrive20', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x2'), 'iX2 xDrive30', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X3', 'x3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'sDrive20i', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'xDrive20i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'xDrive30i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'M40i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'M50', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'X3 M Competition', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'xDrive20d', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'xDrive30d', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'M40d', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'xDrive30e', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x3'), 'iX3', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X4', 'x4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x4'), 'xDrive20i', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x4'), 'xDrive28i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x4'), 'xDrive30i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x4'), 'M40i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x4'), 'X4 M Competition', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x4'), 'xDrive20d', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x4'), 'xDrive30d', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x4'), 'M40d', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X5', 'x5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'xDrive35i', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'xDrive40i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'xDrive50i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'M50i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'M60i', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'X5 M Competition', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'xDrive25d', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'xDrive30d', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'xDrive40d', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'M50d', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'xDrive45e', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x5'), 'xDrive50e', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X6', 'x6') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x6'), 'xDrive35i', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x6'), 'xDrive40i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x6'), 'M50i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x6'), 'M60i', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x6'), 'X6 M Competition', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x6'), 'xDrive30d', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x6'), 'xDrive40d', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x6'), 'M50d', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X7', 'x7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x7'), 'xDrive40i', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x7'), 'M50i', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x7'), 'M60i', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x7'), 'Alpina XB7', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x7'), 'xDrive40d', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x7'), 'M50d', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XM', 'xm') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'xm'), 'XM 50e', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'xm'), 'XM', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'xm'), 'XM Label', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'I3', 'i3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'I8', 'i8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Competition', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Executive', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XLine', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'M-Sport', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'M-Performance', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'M', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Xdrive', 10) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- BYD
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('BYD', 'byd', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'BYD';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Atto', 'atto') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Dolphin', 'dolphin') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Seal', 'seal') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Seagull', 'seagull') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sealion', 'sealion') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Song', 'song') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Shark', 'shark') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tang', 'tang') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Active', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Boost', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Dynamic', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Comfort', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Design', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Superior', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ultra', 7) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Cadillac
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Cadillac', 'cadillac', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Cadillac';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Escalade', 'escalade') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium Luxury', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Platinum', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'V Series', 4) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Changan
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Changan', 'changan', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Changan';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Deepal S07', 'deepal-s07') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Comfort', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Lite', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxe', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Future Sense', 4) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Chery
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Chery', 'chery', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Chery';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tiggo 7', 'tiggo-7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tiggo 8', 'tiggo-8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tiggo 9', 'tiggo-9') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Aspire', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Distinction', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Summit', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Executive', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 4) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Chevrolet
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Chevrolet', 'chevrolet', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Chevrolet';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corvette', 'corvette') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Camaro', 'camaro') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Captiva', 'captiva') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corsa', 'corsa') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Blazer', 'blazer') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cruze', 'cruze') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Impala', 'impala') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Optra', 'optra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sonic', 'sonic') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Silverado', 'silverado') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tahoe', 'tahoe') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Trailblazer', 'trailblazer') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vectra', 'vectra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vivaro', 'vivaro') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'WT', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Custom', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LS', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'RS', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LT', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premier', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'High Country', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Trailboss', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LTZ', 8) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Chrysler
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Chrysler', 'chrysler', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Chrysler';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '300', '300') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'C', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LX', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Touring', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Select', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pinnacle', 6) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Citroen
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Citroen', 'citroen', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Citroen';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C3', 'c3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C3 Aircross', 'c3-aircross') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C4', 'c4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C4 Aircross', 'c4-aircross') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C4 Picasso', 'c4-picasso') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C4 Space Tourer', 'c4-space-tourer') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C4 Cactus', 'c4-cactus') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C4 X', 'c4-x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C5', 'c5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C5 X', 'c5-x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C5 Aircross', 'c5-aircross') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Berlingo', 'berlingo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'DS', 'ds') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'DS3', 'ds3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'DS4', 'ds4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'DS5', 'ds5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'You', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Plus', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Max', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sense', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sense Plus', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Shine', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Shine Plus', 6) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Cupra
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Cupra', 'cupra', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Cupra';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ateca', 'ateca') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Born', 'born') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Formentor', 'formentor') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Leon', 'leon') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tavascan', 'tavascan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Terramar', 'terramar') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'V1', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'V2', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'VZ1', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'VZ2', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'VZ3', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'VZN', 5) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Dacia
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Dacia', 'dacia', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Dacia';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Duster', 'duster') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Bigster', 'bigster') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Jogger', 'jogger') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sandero', 'sandero') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Essential', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Expression', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Journey', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Extreme', 3) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Daihatsu
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Daihatsu', 'daihatsu', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Daihatsu';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Altis', 'altis') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Boon', 'boon') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Be:Go', 'be-go') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cast', 'cast') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Charade', 'charade') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Copen', 'copen') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mira E:S', 'mira-e-s') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Move', 'move') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Move Canbus', 'move-canbus') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Taft', 'taft') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tanto', 'tanto') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Hi Jet', 'hi-jet') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Gran Max', 'gran-max') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Thor', 'thor') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Rocky', 'rocky') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Terios', 'terios') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Activa', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'L', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'G', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'G Turbo', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Z', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Custom', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Custom RS', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Style', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 10) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Datsun
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Datsun', 'datsun', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Datsun';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Go', 'go') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Go Plus', 'go-plus') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cross', 'cross') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'On Do', 'on-do') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mi Do', 'mi-do') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Go', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Go+', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Red-GO', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'D', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'A', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'T', 5) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Denza
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Denza', 'denza', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Denza';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'B5', 'b5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'B8', 'b8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'D9', 'd9') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'N7', 'n7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'N8', 'n8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'N9', 'n9') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Z9', 'z9') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Z9 GT', 'z9-gt') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Entry', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Deluxe', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Advanced', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Flagship', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Performance', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Performance AWD', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Prestige', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Max', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pro', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ultra', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'BEV', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'PHEV', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited First Edition', 14) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Dodge
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Dodge', 'dodge', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Dodge';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Charger', 'charger') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Challenger', 'challenger') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Journey', 'journey') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SXT', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT Plus', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R/T', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Scat Pack', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SRT Hellcat', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Redeye', 7) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Ferrari
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Ferrari', 'ferrari', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Ferrari';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '458', '458') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'FF', 'ff') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'F12 Berlinetta', 'f12-berlinetta') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '488', '488') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '812 Superfast', '812-superfast') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GTC4Lusso', 'gtc4lusso') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'F8', 'f8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Portofino', 'portofino') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Roma', 'roma') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SF90', 'sf90') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '296 GTB/GTS', '296-gtb-gts') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '12 Cilindri', '12-cilindri') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'F80', 'f80') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Purosangue', 'purosangue') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GTB', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GTS', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Spider', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Stradale', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Speciale', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pista', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'TDF', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Modificata', 8) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Fiat
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Fiat', 'fiat', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Fiat';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Abarth', 'abarth') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '500', '500') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '500X', '500x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '500e', '500e') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '600e', '600e') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Panda', 'panda') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tipo', 'tipo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Doblo', 'doblo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ducato', 'ducato') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pop', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pop Star', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Trekking', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Connect', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Dolcevita', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'La Prima', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Classica', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Lusso', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Turismo', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Competizione', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, '595', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, '695', 12) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Ford
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Ford', 'ford', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Ford';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Bronco', 'bronco') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Capri', 'capri') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cortina', 'cortina') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Escort', 'escort') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Escape', 'escape') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Fiesta', 'fiesta') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Focus', 'focus') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'F150', 'f150') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'F150 Raptor', 'f150-raptor') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ranger', 'ranger') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ranger Raptor', 'ranger-raptor') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mustang', 'mustang') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Kuga', 'kuga') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Everest', 'everest') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mondeo', 'mondeo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Puma', 'puma') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Figo', 'figo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C-Max', 'c-max') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S-Max', 's-max') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Active', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XL', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XLT', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Raptor', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Tremor', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Wildtrak', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Platinum', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Lariat', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'ST', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'ST Line', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ecoboost', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ecoboost Premium', 13) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Geely
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Geely', 'geely', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Geely';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Coolray', 'coolray') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'E5', 'e5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EX5', 'ex5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pro', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Max', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GK', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GF', 4) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- GWM
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('GWM', 'gwm', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'GWM';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'ORA', 'ora') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Funky Cat', 'funky-cat') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tank 300', 'tank-300') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tank 500', 'tank-500') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Haval Jolion', 'haval-jolion') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Haval H6', 'haval-h6') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Haval H6 GT', 'haval-h6-gt') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Super Luxury', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ultra Luxury', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Vant', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pure', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pure+', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pro+', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 8) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Honda
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Honda', 'honda', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Honda';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Airwave', 'airwave') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Crossroad', 'crossroad') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Brio', 'brio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Fit/Jazz', 'fit-jazz') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Fit Shuttle', 'fit-shuttle') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'City', 'city') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Civic', 'civic') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Civic Type R', 'civic-type-r') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Freed', 'freed') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Grace', 'grace') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Jade', 'jade') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Legend', 'legend') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Life', 'life') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Insight', 'insight') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mobilio', 'mobilio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Prelude', 'prelude') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'NSX', 'nsx') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S660', 's660') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Stream', 'stream') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Odyssey', 'odyssey') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Stepwagon', 'stepwagon') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'BR-V', 'br-v') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CR-V', 'cr-v') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Elevate', 'elevate') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'WR-V', 'wr-v') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'HR-V', 'hr-v') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vezel', 'vezel') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'N-Box', 'n-box') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'N-One', 'n-one') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'N-Van', 'n-van') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'N-Wgn', 'n-wgn') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Accord', 'accord') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Elite', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LX', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'EX', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'EX-L', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport-L', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport Touring', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Type R', 8) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Hyundai
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Hyundai', 'hyundai', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Hyundai';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Accent', 'accent') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Genesis', 'genesis') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'i10', 'i10') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'i20', 'i20') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'i30', 'i30') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'i40', 'i40') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Inster', 'inster') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'IONIQ', 'ioniq') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'IONIQ 5', 'ioniq-5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'IONIQ 6', 'ioniq-6') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'IONIQ 9', 'ioniq-9') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'IX35', 'ix35') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Kona', 'kona') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Santa Fe', 'santa-fe') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sonata', 'sonata') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tucson', 'tucson') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Veloster', 'veloster') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE-L', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'N-Line', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'N', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Calligraphy', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XRT', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Standard Range', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Long Range', 8) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Isuzu
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Isuzu', 'isuzu', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Isuzu';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'D-Max', 'd-max') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'MU-X', 'mu-x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Bighorn', 'bighorn') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Como', 'como') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Elf', 'elf') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Forward', 'forward') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Giga', 'giga') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Trooper', 'trooper') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'FVZ', 'fvz') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'FSR', 'fsr') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'FRR', 'frr') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Active', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Elegant', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ultimate', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Utility', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'L', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LS', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LSE', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'V Cross', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'RS', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X-Rider', 9) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- JAC
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('JAC', 'jac', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'JAC';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'T6', 't6') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'T8', 't8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'T9', 't9') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X200', 'x200') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Oasis', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Osprey', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Haven', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Prestige', 5) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Jaecoo
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Jaecoo', 'jaecoo', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Jaecoo';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'J5', 'j5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'J7', 'j7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Deluxe', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Performance', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Vortex', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Glacier', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Inferno', 5) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Jaguar
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Jaguar', 'jaguar', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Jaguar';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XE', 'xe') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XF', 'xf') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XK', 'xk') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XJ', 'xj') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'E-Pace', 'e-pace') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'I-Pace', 'i-pace') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'F-Pace', 'f-pace') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'F-Type', 'f-type') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S-Type', 's-type') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'HSE', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'First Edition', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R-Dynamic', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R-Dynamic SE', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R-Dynamic HSE', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SVR', 7) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Jeep
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Jeep', 'jeep', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Jeep';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Avenger', 'avenger') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Compass', 'compass') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cherokee', 'cherokee') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Grand Cherokee', 'grand-cherokee') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Renegade', 'renegade') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Gladiator', 'gladiator') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Patriot', 'patriot') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Wrangler', 'wrangler') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Laredo', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Latitude', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Altitude', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Overland', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Summit', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sahara', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Rubicon', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Trailhawk', 10) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Jetour
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Jetour', 'jetour', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Jetour';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Dashing', 'dashing') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'T1', 't1') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'T2', 't2') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X70', 'x70') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Edge', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Aspire', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Explorer', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Odyssey', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Elite', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Exclusive', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Flagship', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Momentum', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Deluxe', 11) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Kia
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Kia', 'kia', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Kia';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ceed', 'ceed') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Carnival', 'carnival') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Carens', 'carens') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cerato', 'cerato') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EV3', 'ev3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EV4', 'ev4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EV5', 'ev5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EV6', 'ev6') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EV9', 'ev9') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Forte', 'forte') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'K4', 'k4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Picanto', 'picanto') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Proceed', 'proceed') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Niro', 'niro') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Rio', 'rio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Seltos', 'seltos') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Stinger', 'stinger') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sonet', 'sonet') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Soul', 'soul') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sorento', 'sorento') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sportage', 'sportage') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Stonic', 'stonic') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Telluride', 'telluride') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tasman', 'tasman') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LX', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'EX', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'EX X-Line', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SX', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SX X-Line', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SX X-Pro', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SX Prestige', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT-Line', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Light', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Wind', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Land', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'KX', 12) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Lamborghini
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Lamborghini', 'lamborghini', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Lamborghini';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Huracan', 'huracan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Aventador', 'aventador') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Urus', 'urus') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Temerario', 'temerario') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Revuelto', 'revuelto') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ultime', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SV', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SVJ', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'EVO', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'STO', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Tecnica', 7) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Land Rover
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Land Rover', 'land-rover', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Land Rover';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Defender 90', 'defender-90') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Defender 110', 'defender-110') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Defender 130', 'defender-130') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Range Rover Evoque', 'range-rover-evoque') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Range Rover Sport', 'range-rover-sport') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Range Rover', 'range-rover') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Range Rover Velar', 'range-rover-velar') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Discovery', 'discovery') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Discovery Sport', 'discovery-sport') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'HSE', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Dynamic SE', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Dynamic HSE', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Autobiography', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R Dynamic', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R Dynamic SE', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R Dynamic HSE', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XS', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GS', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SV', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'OCTA', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X-Dynamic SE', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X-Dynamic HSE', 15) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'First Edition', 16) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Launch Edition', 17) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'HSE Luxury', 18) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Lexus
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Lexus', 'lexus', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Lexus';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CT', 'ct') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'ES', 'es') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GS', 'gs') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GX', 'gx') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'IS', 'is') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'LC', 'lc') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'LS', 'ls') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'LX', 'lx') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'NX', 'nx') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RC', 'rc') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RX', 'rx') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'UX', 'ux') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ultra Luxury', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'F SPORT', 4) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Maserati
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Maserati', 'maserati', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Maserati';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Levante', 'levante') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Gran Turismo', 'gran-turismo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Grecale', 'grecale') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Gran Cabrio', 'gran-cabrio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Quattroporte', 'quattroporte') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Modena', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Trofeo', 2) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Mazda
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Mazda', 'mazda', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Mazda';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Atenza Sedan', 'atenza-sedan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Atenza Wagon', 'atenza-wagon') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Axela Sedan', 'axela-sedan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Axela Sport', 'axela-sport') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Biante', 'biante') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Bongo', 'bongo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Carol', 'carol') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CX-3', 'cx-3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CX-5', 'cx-5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CX-60', 'cx-60') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CX-7', 'cx-7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CX-70', 'cx-70') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CX-80', 'cx-80') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CX-90', 'cx-90') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CX-8', 'cx-8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CX-9', 'cx-9') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Demio', 'demio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mazda 2', 'mazda-2') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mazda 3 Sedan', 'mazda-3-sedan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mazda 3 Fastback', 'mazda-3-fastback') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mazda 5', 'mazda-5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mazda 6 Sedan', 'mazda-6-sedan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mazda 6 Wagon', 'mazda-6-wagon') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '323', '323') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'BT-50', 'bt-50') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'MX-30', 'mx-30') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'MX-5', 'mx-5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tribute', 'tribute') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RX-7', 'rx-7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RX-8', 'rx-8') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Flair', 'flair') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Familia', 'familia') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Scrum', 'scrum') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Premacy', 'premacy') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Roadster', 'roadster') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Titan', 'titan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Verisa', 'verisa') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'C', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S-Touring', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S-L Package', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XD', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XD-L Package', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Proactive', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S Proactive', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XD Proactive', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Urban Dresser', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Select', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Turbo', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Exclusive Mode', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium Plus', 15) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Black Tone Edition', 16) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'L-Package', 17) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium Sports', 18) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 19) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Prestige', 20) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- McLaren
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('McLaren', 'mclaren', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'McLaren';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '570', '570') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '600', '600') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '620', '620') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '720', '720') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '750', '750') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '765', '765') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GT', 'gt') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Artura', 'artura') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Performance', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'TechLux', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Vision', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 5) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Mercedes-Benz
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Mercedes-Benz', 'mercedes-benz', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Mercedes-Benz';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'A Class', 'a-class') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'a-class'), 'A 140', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'a-class'), 'A 160', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'a-class'), 'A 170', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'a-class'), 'A 180', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'a-class'), 'A 200', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'a-class'), 'A 220 4MATIC', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'a-class'), 'A 250', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'a-class'), 'AMG A 35', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'a-class'), 'AMG A 45', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'B Class', 'b-class') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'b-class'), 'B 150', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'b-class'), 'B 160', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'b-class'), 'B 170', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'b-class'), 'B 180', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'b-class'), 'B 200', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'b-class'), 'B 220 4MATIC', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'b-class'), 'B 250', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C Class', 'c-class') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 160', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 180', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 200', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 220', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 230', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 240', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 250', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 280', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 300', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 320', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 350', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'C 400', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'AMG C 43', 12) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-class'), 'AMG C 63', 13) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'E Class', 'e-class') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 200', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 220', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 230', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 240', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 250', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 280', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 300', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 320', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 350', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 400', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'E 500', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'AMG E 53', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'e-class'), 'AMG E 63', 12) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'G Class', 'g-class') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'g-class'), 'G 350 d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'g-class'), 'G 400 d', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'g-class'), 'G 500', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'g-class'), 'G 550', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'g-class'), 'AMG G 63', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'g-class'), 'AMG G 65', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S Class', 's-class') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 's-class'), 'S 320', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 's-class'), 'S 350', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 's-class'), 'S 400', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 's-class'), 'S 450', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 's-class'), 'S 500', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 's-class'), 'S 580', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 's-class'), 'S 600', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 's-class'), 'S 680', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 's-class'), 'AMG S 63', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X Class', 'x-class') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x-class'), 'X250d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'x-class'), 'X350d', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'V Class', 'v-class') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'v-class'), 'V220d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'v-class'), 'V250d', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'v-class'), 'V300d', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Viano', 'viano') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vito', 'vito') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'AMG GT', 'amg-gt') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'amg-gt'), 'GT43', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'amg-gt'), 'GT55', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'amg-gt'), 'GT63', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'amg-gt'), 'GT63S', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CLK', 'clk') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CLS', 'cls') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'cls'), 'CLS220d', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'cls'), 'CLS250d', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'cls'), 'CLS300', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'cls'), 'CLS350', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'cls'), 'CLS400', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'cls'), 'CLS450', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'cls'), 'CLS500', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'cls'), 'CLS53', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'cls'), 'CLS63', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GLA', 'gla') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gla'), 'GLA 180', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gla'), 'GLA 200', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gla'), 'GLA 250', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gla'), 'AMG GLA 35', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gla'), 'AMG GLA 45', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GLB', 'glb') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'glb'), 'GLB 180', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'glb'), 'GLB 200', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'glb'), 'GLB 250', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'glb'), 'AMG GLB 35', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GLC', 'glc') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'glc'), 'GLC 200', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'glc'), 'GLC 250', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'glc'), 'GLC 300', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'glc'), 'GLC 43', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'glc'), 'GLC 63', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GLE', 'gle') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gle'), 'GLE 350', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gle'), 'GLE 400', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gle'), 'GLE 450', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gle'), 'GLE 580', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gle'), 'AMG GLE 53', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gle'), 'AMG GLE 63', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GLS', 'gls') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gls'), 'GLS 450', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gls'), 'GLS 500', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gls'), 'GLS 580', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gls'), 'Maybach GLS 600', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gls'), 'AMG GLS 63', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SL', 'sl') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'sl'), 'AMG SL 43', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'sl'), 'AMG SL 55', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'sl'), 'AMG SL 63', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SLC', 'slc') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SLK', 'slk') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'R Class', 'r-class') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Maybach', 'maybach') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '190E', '190e') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ambiente', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Avantgarde', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Avantgarde S', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'AMG Line', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'AMG', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'AMG S', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'BiTurbo', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Classic', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Elegance', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Exclusive Line', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Luxury', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sports Edition', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Laureus Edition', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sportline', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Blue Efficiency', 15) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'CGI', 16) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Designo Edition', 17) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Manufaktur Edition', 18) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Night Edition', 19) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Carbon Edition', 20) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Edition 1', 21) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Kompressor', 22) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, '4Matic', 23) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- MG
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('MG', 'mg', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'MG';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'MG3', 'mg3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'MG4', 'mg4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'MG5', 'mg5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'MG7', 'mg7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'MG Cyberster', 'mg-cyberster') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'MG ZS', 'mg-zs') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'IM5', 'im5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'IM6', 'im6') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Trophy', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Explore', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Excite', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Exclusive', 4) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Mitsubishi
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Mitsubishi', 'mitsubishi', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Mitsubishi';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Airtrek', 'airtrek') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'ASX', 'asx') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Colt', 'colt') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Colt Plus', 'colt-plus') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Chariot', 'chariot') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Diamante', 'diamante') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Delica', 'delica') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Delica Mini', 'delica-mini') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Eclipse', 'eclipse') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Eclipse Cross', 'eclipse-cross') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Galant', 'galant') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Lancer', 'lancer') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Lancer Evolution', 'lancer-evolution') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'L200/Triton', 'l200-triton') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'L300', 'l300') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mirage', 'mirage') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Minicab', 'minicab') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Proudia', 'proudia') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Pajero', 'pajero') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Pajero IO', 'pajero-io') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Pajero Mini', 'pajero-mini') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Outlander', 'outlander') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RVR', 'rvr') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'ES', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LE', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ralliart', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Trail Edition', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SEL', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Black Edition', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'G', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'G Limited', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'M', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'G Plus Package', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GE', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'VR', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'VR-4', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GSR', 15) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'MR', 16) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'RS', 17) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Exceed', 18) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Super Saloon', 19) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Nissan
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Nissan', 'nissan', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Nissan';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ariya', 'ariya') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sentra', 'sentra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'March', 'march') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Advan', 'advan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Atlas', 'atlas') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Bluebird', 'bluebird') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'NV200', 'nv200') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Note', 'note') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Caravan/NV350', 'caravan-nv350') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Civilian', 'civilian') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Clipper', 'clipper') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Kicks', 'kicks') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Avenir', 'avenir') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Primera', 'primera') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Hardbody', 'hardbody') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Serena', 'serena') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Figaro', 'figaro') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sunny', 'sunny') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Altima', 'altima') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Quest', 'quest') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Terrano II', 'terrano-ii') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Skyline', 'skyline') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Skyline Crossover', 'skyline-crossover') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Wingroad', 'wingroad') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Stagea', 'stagea') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Navara/NP300', 'navara-np300') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Elgrand', 'elgrand') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GT-R', 'gt-r') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cube', 'cube') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sylphy', 'sylphy') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Xterra', 'xterra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'X-Trail', 'x-trail') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Murano', 'murano') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Teana', 'teana') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '350Z/Fairlady', '350z-fairlady') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Dayz', 'dayz') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Fuga', 'fuga') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tiida', 'tiida') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sakura', 'sakura') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Versa', 'versa') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Qashqai', 'qashqai') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Rogue', 'rogue') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Roox', 'roox') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Leaf', 'leaf') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Juke', 'juke') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Nissan Z', 'nissan-z') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vanette', 'vanette') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Autech', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Axis', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'DIG-S', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'E-Power', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'E-4ORCE', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Nismo', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Highway Star', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Medalist', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Performance', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Rider', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'RS', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'ST', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Touring', 15) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X', 16) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XV', 17) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Omoda
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Omoda', 'omoda', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Omoda';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '5/C5', '5-c5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'E5', 'e5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '7', '7') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '9', '9') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S5/05', 's5-05') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '3', '3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Comfort', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Knight', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'BX', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'EX', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Noble', 4) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Opel
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Opel', 'opel', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Opel';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corsa', 'corsa') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Insignia', 'insignia') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Astra', 'astra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Grandland', 'grandland') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mokka', 'mokka') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Combo', 'combo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Zafira', 'zafira') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GS', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GSI', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GSE', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Active', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Business', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Elite', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Nav', 6) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Peugeot
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Peugeot', 'peugeot', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Peugeot';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '106', '106') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '205', '205') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '206', '206') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '207', '207') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '208', '208') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '301', '301') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '306', '306') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '308', '308') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '309', '309') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '405', '405') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '406', '406') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '407', '407') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '408', '408') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '508', '508') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '605', '605') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '806', '806') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '2008', '2008') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '3008', '3008') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '4008', '4008') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '5008', '5008') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Boxer', 'boxer') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Expert', 'expert') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Partner', 'partner') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RCZ', 'rcz') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Rifter', 'rifter') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Traveller', 'traveller') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Landtrek', 'landtrek') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Active', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Active Premium', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Allure', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Allure Premium', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Asphalt', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Blue HDI', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Business', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT Exclusive', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT Line', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Puretech', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Style', 12) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Porsche
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Porsche', 'porsche', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Porsche';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '911', '911') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Carrera', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Carrera 4', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Carrera 4S', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Carrera GTS', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Targa 4', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Targa 4S', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Turbo', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Turbo S', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'GT2 RS', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'GT3', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'GT3 RS', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Dakar', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'S/T', 12) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'Sport Classic', 13) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '911'), 'T-Hybrid', 14) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '924', '924') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '928', '928') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '944', '944') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '968', '968') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '718 Spyder', '718-spyder') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Boxster', 'boxster') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cayenne', 'cayenne') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cayman', 'cayman') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Macan', 'macan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Panamera', 'panamera') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Taycan', 'taycan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'E-Hybrid', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT4', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT4 RS', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GTS', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S E-Hybrid', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Platinum Edition', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'RS', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Turbo', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Turbo S', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Turbo S E-Hybrid', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Turbo E-Hybrid', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport Chrono Package', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Black Edition', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Performance', 15) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Renault
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Renault', 'renault', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Renault';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Alpine', 'alpine') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Arkana', 'arkana') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Captur', 'captur') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Clio', 'clio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Kangoo', 'kangoo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Koleos', 'koleos') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Lutecia', 'lutecia') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Megane', 'megane') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Scenic', 'scenic') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Twingo', 'twingo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base Grade', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Basic', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'E-Tech', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Evolution', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Intens', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Techno', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Esprit Alpine', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT Line', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'RS', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'RS Ultime', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Trophy', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Zen', 15) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Rolls Royce
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Rolls Royce', 'rolls-royce', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Rolls Royce';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cullinan', 'cullinan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Phantom', 'phantom') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ghost', 'ghost') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Wraith', 'wraith') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Spectre', 'spectre') ON CONFLICT (make_id, slug) DO NOTHING;
END
$$;

-- SEAT
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('SEAT', 'seat', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'SEAT';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ateca', 'ateca') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ibiza', 'ibiza') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Leon', 'leon') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Leon Cupra', 'leon-cupra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE Technology', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'FR', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'FR Sport', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XPERIENCE', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XPERIENCE LUX', 5) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Smart
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Smart', 'smart', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Smart';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'ForFour', 'forfour') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'ForTwo', 'fortwo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '#1', '1') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '#3', '3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '#5', '5') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Brabus', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pure', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Passion', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Prime', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pro', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Pro+', 6) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Subaru
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Subaru', 'subaru', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Subaru';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Impreza', 'impreza') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Outback', 'outback') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Forester', 'forester') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Levorg', 'levorg') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Legacy', 'legacy') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Levorg Layback', 'levorg-layback') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sambar', 'sambar') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Solterra', 'solterra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XV', 'xv') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Exiga', 'exiga') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Stella', 'stella') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Rex Crossover', 'rex-crossover') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Leone', 'leone') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'BRZ', 'brz') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'WRX', 'wrx') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'WRX STI', 'wrx-sti') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Trezia', 'trezia') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tribeca', 'tribeca') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Chiffon', 'chiffon') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Pleo Plus', 'pleo-plus') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Advance', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'B Sport', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Eyesight', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Sport', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Limited', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Touring', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Wilderness', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'I-L', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'I-S', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XT', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SI', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XS', 15) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Cross Sports', 16) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S-Limited', 17) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'STI', 18) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X-Break', 19) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Suzuki
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Suzuki', 'suzuki', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Suzuki';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Alto', 'alto') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Baleno', 'baleno') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Carry', 'carry') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Every', 'every') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Every Wagon', 'every-wagon') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Fronx', 'fronx') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Hustler', 'hustler') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ignis', 'ignis') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Jimny', 'jimny') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Jimny Nomade', 'jimny-nomade') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Jimny Sierra', 'jimny-sierra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Kei', 'kei') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Kizashi', 'kizashi') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Palette', 'palette') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Palette SW', 'palette-sw') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Solio', 'solio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Solio Bandit', 'solio-bandit') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Spacia', 'spacia') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Spacia Base', 'spacia-base') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Spacia Custom', 'spacia-custom') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Spacia Custom Z', 'spacia-custom-z') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Spacia Gear', 'spacia-gear') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Swift', 'swift') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Swift Sport', 'swift-sport') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SX4', 'sx4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'SX4 Cross', 'sx4-cross') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Wagon R', 'wagon-r') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Wagon R Custom', 'wagon-r-custom') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Wagon R Stingray', 'wagon-r-stingray') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Escudo', 'escudo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vitara', 'vitara') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'A', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Base Grade', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Classic', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Custom', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'F', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'FC', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'G', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'G Limited', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Hybrid', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Hybrid G/X', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Hybrid Turbo', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'J Style', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'JC', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'JM', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Join', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'L', 15) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Land Venture', 16) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LX', 17) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'LXI', 18) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Nomade', 19) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'PA', 20) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 21) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 22) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'STD', 23) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SZ', 24) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Turbo', 25) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'V6', 26) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'VXI', 27) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X', 28) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'X-Adventure', 29) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XG', 30) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XL', 31) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'XS', 32) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'ZXI', 33) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Tesla
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Tesla', 'tesla', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Tesla';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Model S', 'model-s') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Model 3', 'model-3') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Model X', 'model-x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Model Y', 'model-y') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Cybertruck', 'cybertruck') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Standard RWD', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium RWD', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Long Range RWD', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Premium Long Range AWD', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Long Range AWD', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Performance', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Plaid', 6) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Toyota
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Toyota', 'toyota', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Toyota';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '86', '86') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '86'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '86'), 'GT', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '86'), 'GR SPORT', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = '86'), 'GT LIMITED', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Allion', 'allion') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Alphard', 'alphard') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'alphard'), '240S', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'alphard'), '240X', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'alphard'), '3.5 Executive Lounge', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'alphard'), '350G', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'alphard'), '350S', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'alphard'), 'G', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'alphard'), 'X', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'alphard'), 'Z', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Alphard Hybrid', 'alphard-hybrid') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Aqua', 'aqua') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'aqua'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'aqua'), 'L', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'aqua'), 'S', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'aqua'), 'U', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'aqua'), 'X', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'aqua'), 'Z', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Auris', 'auris') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Avensis', 'avensis') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Aygo', 'aygo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'bB', 'bb') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'BZ4X', 'bz4x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'bz4x'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'bz4x'), 'Z', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C-HR', 'c-hr') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-hr'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-hr'), 'G-T', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-hr'), 'S', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-hr'), 'S-T', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'c-hr'), 'GR SPORT', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Camry', 'camry') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'camry'), 'Hybrid', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'camry'), 'Hybrid G', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'camry'), 'X', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'camry'), 'XE', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'camry'), 'XS', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'camry'), 'ZV', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'camry'), 'ZX', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Carina', 'carina') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Celica', 'celica') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Century', 'century') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Coaster', 'coaster') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corolla', 'corolla') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla'), 'G-X', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla'), 'Hybrid G', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla'), 'Hybrid X', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla'), 'Hybrid S', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla'), 'Hybrid WxB', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla'), 'S', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla'), 'WxB', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla'), 'X', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corolla Axio', 'corolla-axio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-axio'), '1.3X', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-axio'), '1.5G', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-axio'), '1.5X', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-axio'), 'EX', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-axio'), 'G', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-axio'), 'Hybrid', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-axio'), 'Hybrid G WxB', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-axio'), 'Luxel', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-axio'), 'X', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corolla Cross', 'corolla-cross') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-cross'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-cross'), 'GR SPORT', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-cross'), 'Hybrid G', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-cross'), 'Hybrid S', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-cross'), 'Hybrid Z', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-cross'), 'S', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-cross'), 'Z', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corolla Fielder', 'corolla-fielder') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-fielder'), '1.5G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-fielder'), '1.5X', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-fielder'), '1.8S', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-fielder'), 'EX', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-fielder'), 'Hybrid', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-fielder'), 'Hybrid G WxB', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-fielder'), 'S', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-fielder'), 'X', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'corolla-fielder'), 'Z', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corolla Rumion', 'corolla-rumion') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corolla Sport', 'corolla-sport') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corolla Touring', 'corolla-touring') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Crown', 'crown') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'crown'), 'Athlete', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'crown'), 'Royal Saloon', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'crown'), 'RS', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Crown Crossover', 'crown-crossover') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'crown-crossover'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'crown-crossover'), 'G Advanced', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'crown-crossover'), 'RS', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'crown-crossover'), 'RS Advanced', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'crown-crossover'), 'X', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'crown-crossover'), 'Z', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Crown Estate', 'crown-estate') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Crown Sport', 'crown-sport') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Dyna Truck', 'dyna-truck') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Esquire', 'esquire') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Estima', 'estima') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'FJ Cruiser', 'fj-cruiser') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GR86', 'gr86') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gr86'), 'RC', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gr86'), 'RZ', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gr86'), 'SZ', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GR Corolla', 'gr-corolla') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gr-corolla'), 'RZ', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gr-corolla'), 'RZ Morizo Edition', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GR Yaris', 'gr-yaris') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gr-yaris'), 'RC', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gr-yaris'), 'RS', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gr-yaris'), 'RZ', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'gr-yaris'), 'High Performance', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'GRMN Yaris', 'grmn-yaris') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Granace', 'granace') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Harrier', 'harrier') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'harrier'), 'Elegance', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'harrier'), 'Premium', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'harrier'), 'Progress', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'harrier'), 'S', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'harrier'), 'Z', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'harrier'), 'Z Leather Package', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Harrier Hybrid', 'harrier-hybrid') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Harrier PHEV', 'harrier-phev') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Hiace Commuter', 'hiace-commuter') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Hiace Van', 'hiace-van') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hiace-van'), 'DX', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hiace-van'), 'GL', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hiace-van'), 'Super Long DX', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hiace-van'), 'Super Long GL', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Hilux', 'hilux') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hilux'), 'Basegrade', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hilux'), 'GR SPORT', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hilux'), 'Invincible', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hilux'), 'Invincible X', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hilux'), 'Revo Rocco', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hilux'), 'SR', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hilux'), 'SR5', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hilux'), 'X', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'hilux'), 'Z', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Hilux Surf', 'hilux-surf') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Isis', 'isis') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ist', 'ist') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Kluger', 'kluger') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Land Cruiser', 'land-cruiser') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser'), 'AX', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser'), 'AX-G', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser'), 'GX', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser'), 'GR SPORT', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser'), 'Sahara', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser'), 'VX', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser'), 'ZX', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Land Cruiser 100', 'land-cruiser-100') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Land Cruiser 250', 'land-cruiser-250') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-250'), 'GX', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-250'), 'TX', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-250'), 'VX', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-250'), 'ZX', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Land Cruiser 70', 'land-cruiser-70') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Land Cruiser 76', 'land-cruiser-76') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Land Cruiser 79', 'land-cruiser-79') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Land Cruiser 80', 'land-cruiser-80') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Land Cruiser Prado', 'land-cruiser-prado') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-prado'), 'GX', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-prado'), 'TX', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-prado'), 'TX-L', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-prado'), 'TZ', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-prado'), 'TZ-G', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-prado'), 'VX', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-prado'), 'VX-L', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-prado'), 'Kakadu', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'land-cruiser-prado'), 'ZX', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Liteace', 'liteace') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mark II', 'mark-ii') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mark X', 'mark-x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'mark-x'), '250G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'mark-x'), '250S', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'mark-x'), '350G', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'mark-x'), '350S', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'mark-x'), 'Premium', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'mark-x'), 'Vertiga', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mirai', 'mirai') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Noah', 'noah') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'noah'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'noah'), 'Hybrid G', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'noah'), 'Hybrid SI', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'noah'), 'Hybrid X', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'noah'), 'SI', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'noah'), 'X', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Passo', 'passo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Pixis Epoch', 'pixis-epoch') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Pixis Joy', 'pixis-joy') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Pixis Mega', 'pixis-mega') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Pixis Space', 'pixis-space') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Porte', 'porte') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Premio', 'premio') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'premio'), '1.5F', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'premio'), '1.8X', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'premio'), '2.0G', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Prius', 'prius') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'prius'), 'A Touring', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'prius'), 'G', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'prius'), 'L', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'prius'), 'S', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'prius'), 'U', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'prius'), 'X', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'prius'), 'Z', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Prius Alpha', 'prius-alpha') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Prius PHV', 'prius-phv') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Probox', 'probox') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'probox'), 'DX', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'probox'), 'F', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'probox'), 'G', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'probox'), 'GL', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'probox'), 'Hybrid F', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'probox'), 'Hybrid GL', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Ractis', 'ractis') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Raize', 'raize') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'raize'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'raize'), 'X', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'raize'), 'X S', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'raize'), 'Z', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'RAV4', 'rav4') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'rav4'), 'Adventure', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'rav4'), 'G', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'rav4'), 'G Z Package', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'rav4'), 'Hybrid Adventure', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'rav4'), 'Hybrid G', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'rav4'), 'Hybrid X', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'rav4'), 'Hybrid Z', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'rav4'), 'Sport', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'rav4'), 'X', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Regius Ace', 'regius-ace') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Roomy', 'roomy') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'roomy'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'roomy'), 'G S', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'roomy'), 'G-T', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'roomy'), 'X', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'roomy'), 'X S', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Rush', 'rush') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sai', 'sai') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sienta', 'sienta') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'sienta'), 'Dice', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'sienta'), 'Funbase', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'sienta'), 'G', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'sienta'), 'Hybrid G', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'sienta'), 'Hybrid Funbase', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Spade', 'spade') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Starlet', 'starlet') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Succeed', 'succeed') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Supra', 'supra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'supra'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'supra'), 'GT', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'supra'), 'GT Twin Turbo', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'supra'), 'GZ', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'supra'), 'S', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'supra'), 'SZ-R', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tank', 'tank') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Townace Truck', 'townace-truck') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Townace Van', 'townace-van') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vanguard', 'vanguard') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vellfire', 'vellfire') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vellfire'), '2.4V', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vellfire'), '2.4Z', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vellfire'), '2.5V', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vellfire'), '2.5Z', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vellfire'), '3.5V', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vellfire'), '3.5Z', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vellfire'), 'Executive Lounge', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vellfire'), 'Golden Eyes', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vellfire'), 'Z Premier', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vitz', 'vitz') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), '1.0F', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), '1.3F', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), 'F L', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), 'GR SPORT', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), 'Hybrid F', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), 'Hybrid Jewela', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), 'Jewela', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), 'RS', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), 'U', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'vitz'), 'X', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Voxy', 'voxy') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'S-G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'S-Z', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'S', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'V', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'X', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'Z', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'ZS', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'Hybrid S-G', 7) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'Hybrid S-Z', 8) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'Hybrid X', 9) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'Hybrid V', 10) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'voxy'), 'Hybrid ZS', 11) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Wish', 'wish') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'wish'), '1.8S', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'wish'), '1.8X', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'wish'), '2.0G', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'wish'), '2.0Z', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Yaris', 'yaris') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris'), 'X', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris'), 'Z', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris'), 'Hybrid G', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris'), 'Hybrid U', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris'), 'Hybrid X', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris'), 'Hybrid Z', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Yaris Cross', 'yaris-cross') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris-cross'), 'G', 0) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris-cross'), 'GR SPORT', 1) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris-cross'), 'Hybrid G', 2) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris-cross'), 'Hybrid GR SPORT', 3) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris-cross'), 'Hybrid U', 4) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris-cross'), 'Hybrid X', 5) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris-cross'), 'Hybrid Z', 6) ON CONFLICT (model_id, name) DO NOTHING;
  INSERT INTO public.car_variants (model_id, name, sort_order) VALUES ((SELECT id FROM public.car_models WHERE make_id = v_make_id AND slug = 'yaris-cross'), 'Hybrid Z Adventure', 7) ON CONFLICT (model_id, name) DO NOTHING;
END
$$;

-- Vauxhall
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Vauxhall', 'vauxhall', false) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Vauxhall';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Astra', 'astra') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Astra Electric', 'astra-electric') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Corsa', 'corsa') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Combo', 'combo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Crossland', 'crossland') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Crossland X', 'crossland-x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Grandland', 'grandland') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Grandland X', 'grandland-x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Grandland Electric', 'grandland-electric') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Insignia', 'insignia') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mokka', 'mokka') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mokka X', 'mokka-x') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Mokka Electric', 'mokka-electric') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Vivaro', 'vivaro') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SRI', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Elite', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ultimate', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE Premium', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SRI Premium', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Elite Premium', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Design', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GS', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GSe', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Griffin', 10) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Volkswagen
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Volkswagen', 'volkswagen', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Volkswagen';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Amarok', 'amarok') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Arteon', 'arteon') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Beetle', 'beetle') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Caddy', 'caddy') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Caravelle', 'caravelle') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'CC', 'cc') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'City', 'city') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Crafter', 'crafter') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Golf', 'golf') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Jetta', 'jetta') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Kombi', 'kombi') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Passat', 'passat') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Polo', 'polo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Polo Vivo', 'polo-vivo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Scirocco', 'scirocco') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Sharan', 'sharan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'T-Cross', 't-cross') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'T-Roc', 't-roc') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Taigo', 'taigo') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tayron', 'tayron') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tiguan', 'tiguan') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Tiguan Allspace', 'tiguan-allspace') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Touareg', 'touareg') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Touran', 'touran') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'Transporter', 'transporter') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'UP', 'up') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'S', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Trendline', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Life', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Comfort', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Style', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Match', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SEL', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Highline', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R-line', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GTI', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GTD', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GTE', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'GT Plus', 15) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE with Tech', 16) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Black Edition', 17) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

-- Volvo
INSERT INTO public.car_makes (name, slug, is_popular) VALUES ('Volvo', 'volvo', true) ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, is_popular = EXCLUDED.is_popular;
DO $$
DECLARE v_make_id uuid;
BEGIN
  SELECT id INTO v_make_id FROM public.car_makes WHERE name = 'Volvo';
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '850', '850') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, '960', '960') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C30', 'c30') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C40', 'c40') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'C70', 'c70') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EC40', 'ec40') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'ES90', 'es90') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EX30', 'ex30') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EX30 Cross Country', 'ex30-cross-country') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EX40', 'ex40') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EX60', 'ex60') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'EX90', 'ex90') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S40', 's40') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S60', 's60') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S80', 's80') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'S90', 's90') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'V40', 'v40') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'V40 Cross Country', 'v40-cross-country') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'V50', 'v50') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'V60', 'v60') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'V60 Cross Country', 'v60-cross-country') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'V70', 'v70') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'V90', 'v90') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'V90 Cross Country', 'v90-cross-country') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XC40', 'xc40') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XC60', 'xc60') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XC70', 'xc70') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_models (make_id, name, slug) VALUES (v_make_id, 'XC90', 'xc90') ON CONFLICT (make_id, slug) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Core', 0) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Plus', 1) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Plus Pro', 2) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ultra', 3) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Black Edition', 4) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Momentum', 5) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Inscription', 6) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'R-Design', 7) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Cross Country', 8) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Polestar Engineered', 9) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'T3', 10) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'T4', 11) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'T5', 12) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'T6', 13) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'T8 Recharge', 14) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'B4', 15) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'B5', 16) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'B6', 17) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'SE', 18) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Ocean Race', 19) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'D4', 20) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'D5', 21) ON CONFLICT (make_id, name) DO NOTHING;
  INSERT INTO public.car_trims (make_id, name, sort_order) VALUES (v_make_id, 'Recharge Ultimate', 22) ON CONFLICT (make_id, name) DO NOTHING;
END
$$;

COMMIT;
