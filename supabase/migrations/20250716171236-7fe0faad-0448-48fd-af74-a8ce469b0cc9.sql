-- Clear expired OpenAI banner URLs from events
UPDATE events 
SET banner_url = NULL 
WHERE banner_url LIKE '%oaidalleapiprodscus.blob.core.windows.net%';