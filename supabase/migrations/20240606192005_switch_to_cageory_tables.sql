BEGIN;

alter type prompt_category rename to prompt_category_old;

-- Step 1: Create a new table called 'prompt_category'
CREATE TABLE prompt_category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Migrate unique category values from 'prompts' to 'prompt_category'
INSERT INTO prompt_category (name)
SELECT DISTINCT unnest(category)
FROM prompts;

-- Step 3: Create a junction table 'prompts_categories'
CREATE TABLE prompts_categories (
  prompt_id uuid NOT NULL,
  category_id uuid NOT NULL,
  PRIMARY KEY (prompt_id, category_id),
  FOREIGN KEY (prompt_id) REFERENCES prompts (id),
  FOREIGN KEY (category_id) REFERENCES prompt_category (id)
);

-- Step 4: Populate the junction table with 'id' from 'prompts' and 'id' from 'prompt_category'
INSERT INTO prompts_categories (prompt_id, category_id)
SELECT prompts.id, prompt_category.id
FROM prompts, prompt_category
WHERE prompt_category.name = ANY(prompts.category::text[]);

-- Step 5: Remove the old 'category' column from the 'prompts' table
ALTER TABLE prompts
DROP COLUMN category;

COMMIT;
