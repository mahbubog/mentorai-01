/*
  # Seed Initial Data

  ## Overview
  Adds initial data for testing including:
  - Course categories
  - Sample instructor
  - Sample courses
  - Site settings
  
  ## Important Notes
  - This is sample data for demonstration
  - Real data should be added through the admin interface
*/

-- Insert course categories
INSERT INTO course_categories (name, slug, display_order) VALUES
  ('Web Development', 'web-development', 1),
  ('Mobile Development', 'mobile-development', 2),
  ('Data Science', 'data-science', 3),
  ('Programming', 'programming', 4),
  ('Business', 'business', 5),
  ('Design', 'design', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample instructor
INSERT INTO instructors (id, name, bio, photo, credentials) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Md. Mahbub Ul Islam', 
   'Experienced software developer and educator with over 10 years of teaching experience. Specialized in web development and programming fundamentals.',
   'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
   'BSc in Computer Science, 10+ years of industry experience, Published author')
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (id, title, slug, short_description, full_description, thumbnail, course_type, difficulty_level, price, duration, instructor_id, status, is_featured) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Complete Web Development Bootcamp',
   'complete-web-development-bootcamp',
   'Master web development from scratch with HTML, CSS, JavaScript, and modern frameworks',
   '<p>This comprehensive course will take you from beginner to advanced web developer. Learn the fundamentals of HTML, CSS, and JavaScript, then dive into modern frameworks and tools used by professional developers.</p><p>You will build real-world projects and gain the skills needed to start your career in web development.</p>',
   'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
   'recorded',
   'beginner',
   4999.00,
   '40 hours',
   '00000000-0000-0000-0000-000000000001',
   'published',
   true),
  
  ('10000000-0000-0000-0000-000000000002',
   'React Advanced Patterns',
   'react-advanced-patterns',
   'Learn advanced React patterns, hooks, and best practices for building scalable applications',
   '<p>Take your React skills to the next level with this advanced course covering modern patterns, performance optimization, and architecture best practices.</p><p>Perfect for developers who already know React basics and want to master advanced concepts.</p>',
   'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
   'recorded',
   'advanced',
   3999.00,
   '25 hours',
   '00000000-0000-0000-0000-000000000001',
   'published',
   true),
  
  ('10000000-0000-0000-0000-000000000003',
   'Python Programming Masterclass',
   'python-programming-masterclass',
   'Complete Python course covering basics to advanced topics including data structures and algorithms',
   '<p>Master Python programming with this comprehensive masterclass. From basic syntax to advanced concepts like decorators, generators, and metaclasses.</p><p>Includes hands-on projects and real-world examples.</p>',
   'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
   'recorded',
   'intermediate',
   3499.00,
   '35 hours',
   '00000000-0000-0000-0000-000000000001',
   'published',
   false),
  
  ('10000000-0000-0000-0000-000000000004',
   'Live Web Development Workshop',
   'live-web-development-workshop',
   'Interactive live sessions covering modern web development with Q&A and hands-on coding',
   '<p>Join our live interactive workshop where you will learn web development in real-time with instructor guidance and peer collaboration.</p><p>Includes live coding sessions, Q&A, and project feedback.</p>',
   'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
   'live',
   'beginner',
   5999.00,
   '8 weeks',
   '00000000-0000-0000-0000-000000000001',
   'published',
   true)
ON CONFLICT (id) DO NOTHING;

-- Map courses to categories
INSERT INTO course_categories_mapping (course_id, category_id) 
SELECT '10000000-0000-0000-0000-000000000001', id FROM course_categories WHERE slug = 'web-development'
ON CONFLICT DO NOTHING;

INSERT INTO course_categories_mapping (course_id, category_id) 
SELECT '10000000-0000-0000-0000-000000000002', id FROM course_categories WHERE slug = 'web-development'
ON CONFLICT DO NOTHING;

INSERT INTO course_categories_mapping (course_id, category_id) 
SELECT '10000000-0000-0000-0000-000000000003', id FROM course_categories WHERE slug = 'programming'
ON CONFLICT DO NOTHING;

INSERT INTO course_categories_mapping (course_id, category_id) 
SELECT '10000000-0000-0000-0000-000000000004', id FROM course_categories WHERE slug = 'web-development'
ON CONFLICT DO NOTHING;

-- Add requirements for first course
INSERT INTO course_requirements (course_id, requirement, display_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Basic computer skills', 1),
  ('10000000-0000-0000-0000-000000000001', 'A computer with internet connection', 2),
  ('10000000-0000-0000-0000-000000000001', 'Willingness to learn and practice', 3)
ON CONFLICT DO NOTHING;

-- Add learning outcomes for first course
INSERT INTO course_learning_outcomes (course_id, outcome, display_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Build responsive websites from scratch using HTML and CSS', 1),
  ('10000000-0000-0000-0000-000000000001', 'Master JavaScript programming fundamentals', 2),
  ('10000000-0000-0000-0000-000000000001', 'Create interactive web applications', 3),
  ('10000000-0000-0000-0000-000000000001', 'Work with modern development tools and workflows', 4),
  ('10000000-0000-0000-0000-000000000001', 'Deploy projects to production', 5)
ON CONFLICT DO NOTHING;

-- Add sections and lessons for first course (recorded)
DO $$
DECLARE
  section1_id uuid;
  section2_id uuid;
BEGIN
  -- Insert sections
  INSERT INTO course_sections (id, course_id, title, description, display_order)
  VALUES 
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'Getting Started', 'Introduction to web development fundamentals', 1)
  RETURNING id INTO section1_id;
  
  INSERT INTO course_sections (id, course_id, title, description, display_order)
  VALUES 
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'HTML Fundamentals', 'Learn the building blocks of web pages', 2)
  RETURNING id INTO section2_id;
  
  -- Insert lessons for section 1
  INSERT INTO course_lessons (section_id, title, description, video_url, duration, is_preview, display_order) VALUES
    (section1_id, 'Welcome to the Course', 'Course overview and what you will learn', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '10:30', true, 1),
    (section1_id, 'Setting Up Your Development Environment', 'Install necessary tools and editors', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '15:45', true, 2),
    (section1_id, 'How the Web Works', 'Understanding client-server architecture', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '12:20', false, 3);
  
  -- Insert lessons for section 2
  INSERT INTO course_lessons (section_id, title, description, video_url, duration, is_preview, display_order) VALUES
    (section2_id, 'Introduction to HTML', 'What is HTML and why it matters', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '14:15', false, 1),
    (section2_id, 'HTML Elements and Tags', 'Learn about different HTML elements', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '18:30', false, 2),
    (section2_id, 'Creating Your First Web Page', 'Build your first HTML page from scratch', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '22:10', false, 3);
END $$;

-- Insert site settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('site_name', 'CourseHub'),
  ('site_tagline', 'Learn, Grow, Succeed'),
  ('contact_email', 'info@coursehub.com'),
  ('contact_phone', '+880 1234567890'),
  ('facebook_url', 'https://facebook.com/coursehub'),
  ('twitter_url', 'https://twitter.com/coursehub'),
  ('linkedin_url', 'https://linkedin.com/company/coursehub'),
  ('payment_bkash_number', '01XXXXXXXXX'),
  ('payment_nagad_number', '01XXXXXXXXX'),
  ('payment_rocket_number', '01XXXXXXXXX')
ON CONFLICT (setting_key) DO NOTHING;