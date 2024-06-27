alter table prompt_category
    add column description text;
alter table prompt_category
    add column page_title text;

-- Coding	AI Prompts for Coding	Generate, debug, and explain code with programming prompts.
-- Design	AI Prompts for AI Images and Design	AI image generation, design ideas, UX tips, and graphic design concepts for creatives.
-- SEO	AI Prompts for SEO & Copywriting	SEO strategies, writing of SEO-optimized articles, keyword research, and optimization tips.
-- Marketing	AI Prompts for Marketing	Marketing strategies, advertising plans, and business growth tips.
-- Productivity	AI Prompts for Productivity	Boost productivity with personal development and career advice.
-- Data Analysis	AI Prompts for Data Analysis	Data analysis, interpretation, and visualization for insights.
-- Support	AI Prompts for Customer Support	Customer support prompts for handling inquiries and complaints.
-- Communication	AI Prompts for Outreach and Email Writing	Professional email writing, communication strategies, and email marketing.
-- SMM	AI Prompts for Social Media	Social media management, content creation, and engagement ideas.
-- Education	AI Prompts for Education	Educational content, learning materials, and study guides.
-- Medical	AI Prompts for Medical Information	Medical information, wellness tips, and mental health advice.
-- Travel	AI Prompts for Travel	Travel tips, destination guides, and itinerary planning.
-- Entertainment AI Prompts for Entertainment	Jokes, trivia, game ideas, and entertainment recommendations.
-- Knowledge	AI Prompts for General Knowledge and Information	Gather factual information, definitions, and expert explanations.

update prompt_category
set name        = 'Coding',
    page_title  = 'AI Prompts for Coding',
    description = 'Generate, debug, and explain code with programming prompts.'
where name = 'Code';

insert into prompt_category (name, page_title, description)
values ('Design', 'AI Prompts for AI Images and Design',
        'AI image generation, design ideas, UX tips, and graphic design concepts for creatives.'),
       ('SEO', 'AI Prompts for SEO & Copywriting',
        'SEO strategies, writing of SEO-optimized articles, keyword research, and optimization tips.'),
       ('Marketing', 'AI Prompts for Marketing', 'Marketing strategies, advertising plans, and business growth tips.'),
       ('Productivity', 'AI Prompts for Productivity',
        'Boost productivity with personal development and career advice.'),
       ('Data Analysis', 'AI Prompts for Data Analysis',
        'Data analysis, interpretation, and visualization for insights.'),
       ('Support', 'AI Prompts for Customer Support',
        'Customer support prompts for handling inquiries and complaints.'),
       ('Communication', 'AI Prompts for Outreach and Email Writing',
        'Professional email writing, communication strategies, and email marketing.'),
       ('SMM', 'AI Prompts for Social Media', 'Social media management, content creation, and engagement ideas.'),
       ('Education', 'AI Prompts for Education', 'Educational content, learning materials, and study guides.'),
       ('Medical', 'AI Prompts for Medical Information',
        'Medical information, wellness tips, and mental health advice.'),
       ('Travel', 'AI Prompts for Travel', 'Travel tips, destination guides, and itinerary planning.'),
       ('Entertainment', 'AI Prompts for Entertainment',
        'Jokes, trivia, game ideas, and entertainment recommendations.'),
       ('Knowledge', 'AI Prompts for General Knowledge and Information',
        'Gather factual information, definitions, and expert explanations.');
