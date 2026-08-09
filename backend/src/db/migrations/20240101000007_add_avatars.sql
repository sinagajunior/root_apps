-- Add dummy avatar URLs to persons
UPDATE persons SET avatar_url = 'https://ui-avatars.com/api/?name=' || REPLACE(full_name, ' ', '+') || '&background=random&color=fff&size=150'
WHERE avatar_url IS NULL;
