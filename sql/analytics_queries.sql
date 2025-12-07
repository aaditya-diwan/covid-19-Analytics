CREATE TABLE covid_daily_summary AS
SELECT 
    location as country,
    date,
    total_cases,
    new_cases,
    total_deaths,
    new_deaths,
    total_vaccinations,
    people_fully_vaccinated,
    population,
    CAST(people_fully_vaccinated AS DOUBLE) / population * 100 as vaccination_rate,
    CASE 
        WHEN total_cases > 0 THEN CAST(total_deaths AS DOUBLE) / total_cases * 100
        ELSE 0 
    END as mortality_rate
FROM owid_covid_data
WHERE location IS NOT NULL
AND date >= DATE '2020-01-01';


CREATE TABLE top_countries_by_cases AS
SELECT 
    country,
    MAX(total_cases) as total_cases,
    MAX(total_deaths) as total_deaths,
    MAX(total_vaccinations) as total_vaccinations
FROM covid_daily_summary
GROUP BY country
ORDER BY total_cases DESC
LIMIT 10;


CREATE TABLE covid_weekly_trends AS
SELECT 
    country,
    DATE_TRUNC('week', date) as week_start,
    SUM(new_cases) as weekly_cases,
    SUM(new_deaths) as weekly_deaths,
    AVG(vaccination_rate) as avg_vaccination_rate
FROM covid_daily_summary
GROUP BY country, DATE_TRUNC('week', date);

CREATE TABLE vaccination_effectiveness AS
SELECT 
    CASE 
        WHEN vaccination_rate < 20 THEN '0-20%'
        WHEN vaccination_rate < 40 THEN '20-40%'
        WHEN vaccination_rate < 60 THEN '40-60%'
        WHEN vaccination_rate < 80 THEN '60-80%'
        ELSE '80-100%'
    END as vaccination_bracket,
    AVG(new_cases) as avg_daily_cases,
    AVG(mortality_rate) as avg_mortality_rate,
    COUNT(DISTINCT country) as num_countries
FROM covid_daily_summary
WHERE vaccination_rate IS NOT NULL
AND date >= DATE '2021-06-01'
GROUP BY vaccination_bracket
ORDER BY vaccination_bracket;

SELECT
    date,
    location,
    continent,
    total_vaccinations,
    people_vaccinated,
    people_fully_vaccinated,
    new_vaccinations,
    population,
    ROUND((people_vaccinated / NULLIF(population, 0)) * 100, 2) as vaccination_rate_percent,
    ROUND((people_fully_vaccinated / NULLIF(population, 0)) * 100, 2) as full_vaccination_rate_percent
FROM covid_data
WHERE location IN ('United States', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
                   'Canada', 'Australia', 'Japan', 'South Korea', 'India', 'Brazil')
    AND total_vaccinations IS NOT NULL
    AND date >= '2020-12-01'
ORDER BY location, date ASC;

SELECT
    date,
    location,
    continent,
    new_cases,
    new_deaths,
    total_cases,
    total_deaths,
    population,
    ROUND((new_cases / NULLIF(population, 0)) * 100000, 2) as new_cases_per_100k,
    ROUND((new_deaths / NULLIF(population, 0)) * 100000, 2) as new_deaths_per_100k
FROM covid_data
WHERE location IN ('United States', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
                   'Canada', 'Australia', 'Japan', 'South Korea', 'Russia', 'Brazil',
                   'India', 'Mexico', 'Netherlands', 'Belgium')
    AND new_cases IS NOT NULL
    AND date >= '2020-03-01'
ORDER BY location, date ASC;

SELECT
    location,
    continent,
    MAX(date) as date,
    MAX(total_cases) as total_cases,
    MAX(total_deaths) as total_deaths,
    MAX(population) as population,
    MAX(CAST(gdp_per_capita AS DOUBLE)) as gdp_per_capita,
    MAX(CAST(population_density AS DOUBLE)) as population_density,
    ROUND((MAX(CAST(total_cases AS DOUBLE)) / NULLIF(MAX(CAST(population AS DOUBLE)), 0)) * 100, 3) as cases_per_100_pop,
    ROUND((MAX(CAST(total_deaths AS DOUBLE)) / NULLIF(MAX(CAST(population AS DOUBLE)), 0)) * 100, 3) as deaths_per_100_pop,
    ROUND((MAX(CAST(total_deaths AS DOUBLE)) / NULLIF(MAX(CAST(total_cases AS DOUBLE)), 0)) * 100, 2) as case_fatality_rate_percent
FROM covid_data
WHERE location NOT IN ('Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America', 'World',
                       'High income', 'Low income', 'Lower middle income', 'Upper middle income')
    AND population > 1000000
    AND gdp_per_capita IS NOT NULL
    AND total_cases IS NOT NULL
GROUP BY location, continent
ORDER BY gdp_per_capita DESC;