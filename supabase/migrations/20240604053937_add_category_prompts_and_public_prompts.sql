begin;
CREATE TYPE prompt_category AS ENUM (
    'Extract',
    'Generate',
    'Transform',
    'Code',
    'Natural Language',
    'Structured Data'
);

alter table prompts
    add column category prompt_category[] default '{}';
alter table prompts
    add column description text default '';
alter table prompts
    add column icon text default '📝' check (char_length(icon) < 10 and icon <> '');

INSERT INTO public.prompts (icon, name, description, content, category, sharing, user_id) VALUES
('📝', 'Grammar correction', E'Convert ungrammatical statements into standard English.', E'You will be provided with statements, and your task is to convert them to standard English. \n\n {{statement}}', '{Transform, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('📊', 'Parse unstructured data', E'Create tables from unstructured text.', E'You will be provided with unstructured data, and your task is to parse it into CSV format. \n\n
There are many fruits that were found on the recently discovered planet Goocrux. There are neoskizzles that grow there, which are purple and taste like candy. There are also loheckles, which are a grayish blue fruit and are very tart, a little bit like a lemon. Pounits are a bright green color and are more savory than sweet. There are also plenty of loopnovas which are a neon pink flavor and taste like cotton candy. Finally, there are fruits called glowls, which have a very sour and bitter taste which is acidic and caustic, and a pale orange tinge to them.', '{Extract, Structured Data}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('⏱️', 'Calculate time complexity', E'Find the time complexity of a function.', E'You will be provided with Python code, and your task is to calculate its time complexity. \n\n {{code}}', '{Code}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🔍', 'Keywords', 'Extract keywords from a block of text.', E'
You will be provided with a block of text, and your task is to extract a list of keywords from it. \n\n {{input}}', '{Extract, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🐞', 'Python bug fixer', 'Find and fix bugs in source code.', E'You will be provided with a piece of Python code, and your task is to find and fix bugs in it. \n\n {{code}}', '{Code}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('📊', 'Tweet classifier', 'Detect sentiment in a tweet.', E'
You will be provided with a tweet, and your task is to classify its sentiment as positive, neutral, or negative. \n {{tweet}}', '{Extract, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🎨', 'Mood to color', 'Turn a text description into a color.', E'
You will be provided with a description of a mood, and your task is to generate the CSS code for a color that matches it. Write your output in json with a single key called "css_code". \n {{mood}}', '{Transform}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🤖', 'Marv the sarcastic chat bot', 'Marv is a factual chatbot that is also sarcastic.', 'You are Marv, a chatbot that reluctantly answers questions with sarcastic responses.', '{Generate, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('📝', 'Interview questions', 'Create interview questions.', 'Create a list of 8 questions for an interview with a science fiction author.', '{Generate}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('💡', 'Improve code efficiency', 'Provide ideas for efficiency improvements to Python code.', E'You will be provided with a piece of Python code, and your task is to provide ideas for efficiency improvements. \n\n {code}', '{Code}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🎤', 'Rap battle writer', 'Generate a rap battle between two characters.', 'Write a rap battle between Alan Turing and Claude Shannon.', '{Generate}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('😊', 'Emoji chatbot', 'Generate conversational replies using emojis only.', 'You will be provided with a message, and your task is to respond using emojis only.', '{Generate, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🎓', 'Socratic tutor', 'Generate responses as a Socratic tutor.', 'You are a Socratic tutor. Use the following principles in responding to students:

    - Ask thought-provoking, open-ended questions that challenge students'' preconceptions and encourage them to engage in deeper reflection and critical thinking.
    - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.
    - Actively listen to students'' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.
    - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.
    - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.
    - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.', '{Generate, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('📝', 'Meeting notes summarizer', E'Summarize meeting notes including overall discussion, action items, and future topics.', E'
You will be provided with meeting notes, and your task is to summarize the meeting as follows:

    -Overall summary of discussion
    -Action items (what needs to be done and who is doing it)
    -If applicable, a list of topics that need to be discussed more fully in the next meeting. \n\n {{notes}}', '{Transform, Structured Data}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🔍', 'Pro and con discusser', 'Analyze the pros and cons of a given topic.', 'Analyze the pros and cons of remote work vs. office work', '{Extract, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('📚', 'Summarize for a 2nd grader', 'Simplify text to a level appropriate for a second-grade student.', E'Summarize content you are provided with for a second-grade student. \n\n {{content}}', '{Transform, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('😊', 'Emoji Translation', 'Translate regular text into emoji text.', E'You will be provided with text, and your task is to translate it into emojis. Do not use any regular text. Do your best with emojis only. \n\n {text}', '{Transform, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('💡', 'Explain code', 'Explain a complicated piece of code.', E'
You will be provided with a piece of code, and your task is to explain it in a concise way. \n\n {{code}}', '{Code}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('💡', 'Product name generator', 'Generate product names from a description and seed words.', E'You will be provided with a product description and seed words, and your task is to generate product names. \n\n Description: {{description}}, Seed words: {{seed_words}}', '{Generate}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('📊', 'Spreadsheet creator', 'Create spreadsheets of various kinds of data.', 'Create a two-column CSV of top science fiction movies along with the year of release.', '{Generate, Structured Data}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('✈️', 'Airport code extractor', 'Extract airport codes from text.', '
You will be provided with a text, and your task is to extract the airport codes from it. {text}', '{Extract}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🏋️', 'VR fitness idea generator', 'Generate ideas for fitness promoting virtual reality games.', 'Brainstorm some ideas combining VR and fitness.', '{Generate}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('📍', 'Turn by turn directions', 'Convert natural language to turn-by-turn directions.', 'You will be provided with a text, and your task is to create a numbered list of turn-by-turn directions from it. {{text}}', '{Transform, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('💻', 'Function from specification', 'Create a Python function from a specification.', '
Write a Python function that takes as input a file path to an image, loads the image into memory as a numpy array, then crops the rows and columns around the perimeter if they are darker than a threshold value. Use the mean value of rows and columns to decide if they should be marked for deletion.', '{Code}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('💻', 'Single page website creator', 'Create a single page website.', 'Make a single page website that shows off different neat javascript features for drop-downs and things to display information. The website should be an HTML file with embedded javascript and CSS.', '{Generate, Code}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('📝', 'Memo writer', 'Generate a company memo based on provided points.', 'Draft a company memo to be distributed to all employees. The memo should cover the following specific points without deviating from the topics mentioned and not writing any fact which is not present here:

    Introduction: Remind employees about the upcoming quarterly review scheduled for the last week of April.

    Performance Metrics: Clearly state the three key performance indicators (KPIs) that will be assessed during the review: sales targets, customer satisfaction (measured by net promoter score), and process efficiency (measured by average project completion time).

    Project Updates: Provide a brief update on the status of the three ongoing company projects:

    a. Project Alpha: 75% complete, expected completion by May 30th.
    b. Project Beta: 50% complete, expected completion by June 15th.
    c. Project Gamma: 30% complete, expected completion by July 31st.

    Team Recognition: Announce that the Sales Team was the top-performing team of the past quarter and congratulate them for achieving 120% of their target.

    Training Opportunities: Inform employees about the upcoming training workshops that will be held in May, including "Advanced Customer Service" on May 10th and "Project Management Essentials" on May 25th.', '{Generate}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🌐', 'Translation', 'Translate natural language text.', 'You will be provided with a sentence in English, and your task is to translate it into French.', '{Transform, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('💻', 'Natural language to SQL', 'Convert natural language into SQL queries.', '
Given the following SQL tables, your job is to write queries given a user’s request.

    CREATE TABLE Orders (
      OrderID int,
      CustomerID int,
      OrderDate datetime,
      OrderTime varchar(8),
      PRIMARY KEY (OrderID)
    );

    CREATE TABLE OrderDetails (
      OrderDetailID int,
      OrderID int,
      ProductID int,
      Quantity int,
      PRIMARY KEY (OrderDetailID)
    );

    CREATE TABLE Products (
      ProductID int,
      ProductName varchar(50),
      Category varchar(50),
      UnitPrice decimal(10, 2),
      Stock int,
      PRIMARY KEY (ProductID)
    );

    CREATE TABLE Customers (
      CustomerID int,
      FirstName varchar(50),
      LastName varchar(50),
      Email varchar(100),
      Phone varchar(20),
      PRIMARY KEY (CustomerID)
    ); Write a SQL query which computes the average total order value for all orders on 2023-04-01.', '{Transform, Code}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('🔍', 'Review classifier', 'Classify user reviews based on a set of tags.', E'You will be presented with user reviews and your job is to provide a set of tags from the following list. Provide your answer in bullet point form. Choose ONLY from the list of tags provided here (choose either the positive or the negative tag but NOT both):

    - Provides good value for the price OR Costs too much
    - Works better than expected OR Did not work as well as expected
    - Includes essential features OR Lacks essential features
    - Easy to use OR Difficult to use
    - High quality and durability OR Poor quality and durability
    - Easy and affordable to maintain or repair OR Difficult or costly to maintain or repair
    - Easy to transport OR Difficult to transport
    - Easy to store OR Difficult to store
    - Compatible with other devices or systems OR Not compatible with other devices or systems
    - Safe and user-friendly OR Unsafe or hazardous to use
    - Excellent customer support OR Poor customer support
    - Generous and comprehensive warranty OR Limited or insufficient warranty
\n\n {{reviews}}', '{Extract, Natural Language}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000'),
('📝', 'Lesson plan writer', 'Generate a lesson plan for a specific topic.', 'Write a lesson plan for an introductory algebra class. The lesson plan should cover the distributive law, in particular how it works in simple cases involving mixes of positive and negative numbers. Come up with some examples that show common student errors.', '{Generate}'::prompt_category[], 'public', '00000000-0000-0000-0000-000000000000');
commit;
