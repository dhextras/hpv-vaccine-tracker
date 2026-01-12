INSERT INTO clinic_directory (name, area_tags, phone, whatsapp, address, hours)
VALUES
  (
    'Primary Health Centre - District A',
    ARRAY['Village A', 'Block X', 'District A'],
    '+91XXXXXXXXXX',
    '+91XXXXXXXXXX',
    'Near bus stand, Village A',
    'Mon-Sat 9:00-16:00'
  ),
  (
    'Community Health Center - Block Y',
    ARRAY['Village B', 'Block Y', 'District A'],
    '+91YYYYYYYYYY',
    '+91YYYYYYYYYY',
    'Main road, Village B',
    'Mon-Fri 8:00-14:00'
  ),
  (
    'Government Hospital - District A',
    ARRAY['District A', 'City Center'],
    '+91ZZZZZZZZZZ',
    NULL,
    'Hospital road, City Center',
    '24/7'
  ),
  (
    'Rural Health Clinic - Village C',
    ARRAY['Village C', 'Block Z', 'District B'],
    '+91AAAAAAAAAA',
    '+91AAAAAAAAAA',
    'Near school, Village C',
    'Mon-Sat 10:00-15:00'
  ),
  (
    'District Hospital - Central',
    ARRAY['District A', 'Central Area', 'Main City'],
    '+91BBBBBBBBBB',
    '+91BBBBBBBBBB',
    'Central Hospital Road',
    'Mon-Sun 8:00-20:00'
  )
ON CONFLICT DO NOTHING;
