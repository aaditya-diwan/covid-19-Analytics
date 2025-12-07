import pandas as pd
import os
from datetime import datetime

def process_owid_data(input_file):
    """Process OWID data and create cleaned version"""
    print(f"Processing {input_file}...")

    df = pd.read_csv(input_file)

    df['date'] = pd.to_datetime(df['date'])

    columns_to_keep = [
        'iso_code', 'continent', 'location', 'date',
        'total_cases', 'new_cases', 'total_deaths', 'new_deaths',
        'total_vaccinations', 'people_vaccinated', 'people_fully_vaccinated',
        'new_vaccinations', 'population', 'population_density',
        'median_age', 'aged_65_older', 'aged_70_older', 'gdp_per_capita'
    ]
    
    df_clean = df[columns_to_keep].copy()
    
    df_clean = df_clean.dropna(subset=['location', 'date'])

    os.makedirs('data/processed/owid', exist_ok=True)

    output_file = 'data/processed/owid/owid-covid-processed.csv'
    df_clean.to_csv(output_file, index=False)
    
    print(f"✓ Processed data saved to {output_file}")
    print(f"  Rows: {len(df_clean):,}")
    print(f"  Columns: {len(df_clean.columns)}")
    
    return output_file

def create_aggregated_tables(input_file):
    """Create aggregated tables for faster querying"""
    print("Creating aggregated tables...")
    
    df = pd.read_csv(input_file)
    df['date'] = pd.to_datetime(df['date'])
    

    daily_summary = df.groupby(['location', 'date']).agg({
        'total_cases': 'max',
        'new_cases': 'sum',
        'total_deaths': 'max',
        'new_deaths': 'sum',
        'total_vaccinations': 'max',
        'people_fully_vaccinated': 'max',
        'population': 'first'
    }).reset_index()
    

    daily_summary['vaccination_rate'] = (
        daily_summary['people_fully_vaccinated'] / daily_summary['population'] * 100
    )
    daily_summary['mortality_rate'] = (
        daily_summary['total_deaths'] / daily_summary['total_cases'] * 100
    )
    

    os.makedirs('data/processed/aggregated', exist_ok=True)
    output_file = 'data/processed/aggregated/daily_summary.csv'
    daily_summary.to_csv(output_file, index=False)
    
    print(f"✓ Daily summary saved to {output_file}")
    
    return output_file

if __name__ == '__main__':
    print("=" * 60)
    print("COVID-19 Data Processing Script")
    print("=" * 60)
    
    try:
  
        owid_dir = 'data/raw/owid'
        owid_files = [f for f in os.listdir(owid_dir) if f.endswith('.csv')]
        latest_file = max([os.path.join(owid_dir, f) for f in owid_files], 
                         key=os.path.getctime)
        
        processed_file = process_owid_data(latest_file)
        aggregated_file = create_aggregated_tables(processed_file)
        
        print("\n" + "=" * 60)
        print("✓ All processing completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        exit(1)