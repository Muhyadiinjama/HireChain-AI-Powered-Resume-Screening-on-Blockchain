export type JobCategoryOption = {
    category: string;
    subcategories: string[];
};

export const JOB_CATEGORY_OPTIONS: JobCategoryOption[] = [
    {
        category: 'IT & Software',
        subcategories: [
            'Software Developer (Frontend, Backend, Full Stack)',
            'Cybersecurity (Analyst, Ethical Hacker)',
            'Network Engineer',
            'Data Scientist / Data Analyst',
            'UI/UX Designer',
            'DevOps Engineer',
            'Mobile App Developer'
        ]
    },
    {
        category: 'Medical & Health',
        subcategories: [
            'Doctor (General, Specialist)',
            'Nurse',
            'Pharmacist',
            'Medical Laboratory Technician',
            'Physiotherapist',
            'Radiologist'
        ]
    },
    {
        category: 'Business',
        subcategories: [
            'Accountant',
            'Financial Analyst',
            'Marketing Specialist',
            'Human Resource (HR)',
            'Sales Executive',
            'Entrepreneur / Business Owner'
        ]
    },
    {
        category: 'Education',
        subcategories: [
            'Teacher (Primary, Secondary)',
            'Lecturer / Professor',
            'Tutor',
            'Education Administrator',
            'Curriculum Developer'
        ]
    },
    {
        category: 'Engineering',
        subcategories: [
            'Civil Engineer',
            'Mechanical Engineer',
            'Electrical Engineer',
            'Software Engineer',
            'Industrial Engineer'
        ]
    },
    {
        category: 'Creative',
        subcategories: [
            'Graphic Designer',
            'Video Editor',
            'Photographer',
            'Content Creator',
            'Animator'
        ]
    },
    {
        category: 'Legal',
        subcategories: [
            'Lawyer / Attorney',
            'Legal Advisor',
            'Judge',
            'Paralegal'
        ]
    },
    {
        category: 'Technical Trades',
        subcategories: [
            'Electrician',
            'Plumber',
            'Mechanic',
            'Carpenter',
            'Technician'
        ]
    },
    {
        category: 'Hospitality',
        subcategories: [
            'Hotel Manager',
            'Chef / Cook',
            'Tour Guide',
            'Flight Attendant',
            'Event Planner'
        ]
    },
    {
        category: 'Logistics',
        subcategories: [
            'Driver (Truck, Delivery)',
            'Warehouse Staff',
            'Supply Chain Manager',
            'Dispatcher'
        ]
    }
];

export const JOB_CATEGORY_LABELS = JOB_CATEGORY_OPTIONS.map(({ category }) => category);

export const getSubcategoriesForCategory = (category: string) =>
    JOB_CATEGORY_OPTIONS.find((option) => option.category === category)?.subcategories ?? [];
