INSERT IGNORE INTO country_tbl (name) VALUES 
('Sri Lanka'), ('United States'), ('United Kingdom'), ('India'), ('Australia'), ('Canada'),
('Singapore'), ('Malaysia'), ('Japan'), ('China'), ('South Korea'), ('Germany'),
('France'), ('Italy'), ('Spain'), ('Netherlands'), ('United Arab Emirates'), ('Saudi Arabia'),
('South Africa'), ('New Zealand'), ('Brazil'), ('Mexico'), ('Argentina'), ('Russia'),
('Switzerland'), ('Sweden'), ('Norway'), ('Denmark'), ('Finland'), ('Thailand'),
('Vietnam'), ('Indonesia'), ('Philippines');

INSERT IGNORE INTO currency_tbl (code, name) VALUES 
('LKR', 'Sri Lankan Rupee'), 
('USD', 'US Dollar'), 
('GBP', 'British Pound'), 
('INR', 'Indian Rupee'), 
('AUD', 'Australian Dollar'), 
('CAD', 'Canadian Dollar'),
('SGD', 'Singapore Dollar'),
('MYR', 'Malaysian Ringgit'),
('JPY', 'Japanese Yen'),
('CNY', 'Chinese Yuan'),
('KRW', 'South Korean Won'),
('EUR', 'Euro'),
('AED', 'UAE Dirham'),
('SAR', 'Saudi Riyal'),
('ZAR', 'South African Rand'),
('NZD', 'New Zealand Dollar'),
('BRL', 'Brazilian Real'),
('MXN', 'Mexican Peso'),
('ARS', 'Argentine Peso'),
('RUB', 'Russian Ruble'),
('CHF', 'Swiss Franc'),
('SEK', 'Swedish Krona'),
('NOK', 'Norwegian Krone'),
('DKK', 'Danish Krone'),
('THB', 'Thai Baht'),
('VND', 'Vietnamese Dong'),
('IDR', 'Indonesian Rupiah'),
('PHP', 'Philippine Peso');

INSERT IGNORE INTO subscription_package (subscription_package_id, subscription_package_name, description) VALUES
(1, 'Basic Package', 'Default basic subscription package');
