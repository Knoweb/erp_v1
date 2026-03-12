-- Create company record for company_id = 16 in ginum_apps database
USE ginum_apps;

-- Create the company record with minimal required fields
INSERT INTO company_tbl (
    company_id,
    company_name,
    company_category,
    is_vat_registered,
    email,
    country_id,
    currency_id,
    package_id,
    date_joined,
    status,
    role
) VALUES (
    16,
    'Company16',
    'IT_AND_TECHNOLOGY',
    FALSE,
    'she88@gmail.com',
    1,
    1,
    1,
    CURDATE(),
    'ACTIVE',
    'COMPANY'
);
