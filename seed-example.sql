-- Optional: run this only if you want to test the CMS with a Drive file.
-- Replace the file ID and URLs with your own file.
INSERT INTO projects
(title,category,type,description,media_url,thumbnail_url,drive_id,featured,tags,client,project_date,sort_order,published,created_at,updated_at)
VALUES
('Test Work','Poster Design','graphic','CMS test project','https://drive.google.com/file/d/YOUR_FILE_ID/view','', 'YOUR_FILE_ID', 1, 'poster,test','', '2026-10-03', 1, 1, datetime('now'), datetime('now'));
