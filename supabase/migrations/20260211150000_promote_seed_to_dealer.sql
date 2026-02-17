-- Promote seed user to dealer
DO $$
DECLARE
    v_user_id uuid := 'c44de34e-dd4b-4fcd-921d-a07c6b764312';
    v_dealer_id uuid;
BEGIN
    -- 1. Create Dealer Profile (if not exists)
    INSERT INTO public.dealers (
        profile_id,
        name,
        business_name,
        status,
        mobile,
        email,
        whatsapp,
        city,
        address,
        logo_url,
        about_text,
        contact_person
    ) VALUES (
        v_user_id,
        'AutoList Premium Motors',
        'AutoList Premium Motors Ltd',
        'APPROVED',
        '+254700000000',
        'sales@autolist.com',
        '+254700000000',
        'Nairobi',
        'Ngong Road, Nairobi',
        'https://autolist.com/logo.png', -- Placeholder or update later
        'We are the premier dealer for quality used cars in Nairobi.',
        '{"name": "John Doe", "role": "Sales Manager", "mobile": "+254711111111"}'::jsonb
    )
    ON CONFLICT (profile_id) DO UPDATE SET
        status = 'APPROVED'
    RETURNING id INTO v_dealer_id;

    -- 2. Update Profile Role
    UPDATE public.profiles
    SET role = 'dealer'
    WHERE id = v_user_id;

    -- 3. Assign Listings to Dealer
    UPDATE public.listings
    SET dealer_id = v_dealer_id
    WHERE seller_id = v_user_id;

END $$;
